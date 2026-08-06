# Mezatliyoruz Local APK Build Script
# This script copies the project to C:\Mezatliyoruz_Build (excluding node_modules and android),
# regenerates the android folder fresh on C drive, installs dependencies, patches CMake configuration globally,
# and applies NDK 27 LTO fixes for Reanimated and other native libraries, builds the APK using NDK 27 toolchain.

$ErrorActionPreference = "Stop"

# 1. Clean node_modules junction in destination if exists
if (Test-Path "C:\Mezatliyoruz_Build\node_modules") {
    $item = Get-Item "C:\Mezatliyoruz_Build\node_modules"
    if ($item.Attributes -match "ReparsePoint") {
        Write-Host "Detected node_modules junction. Removing link..." -ForegroundColor Yellow
        cmd /c rmdir "C:\Mezatliyoruz_Build\node_modules"
    }
}

# 2. Sync files from D: to C: using Robocopy (excluding android and node_modules)
Write-Host "Syncing files to C:\Mezatliyoruz_Build..." -ForegroundColor Cyan
$exitCode = 0
try {
    robocopy "D:\Mobil Projeler\Mezatliyoruz" "C:\Mezatliyoruz_Build" /MIR /XD node_modules .git .gradle android .expo /R:2 /W:2
    $exitCode = $LASTEXITCODE
} catch {
    # robocopy sets exit code to non-zero even on success
}

if ($exitCode -ge 8) {
    Write-Error "Robocopy failed with exit code $exitCode"
}
Write-Host "Sync completed successfully." -ForegroundColor Green

# 3. Install NPM dependencies physically on C drive if missing
Set-Location "C:\Mezatliyoruz_Build"
if (-not (Test-Path "C:\Mezatliyoruz_Build\node_modules")) {
    Write-Host "node_modules not found on C drive. Installing dependencies..." -ForegroundColor Cyan
    npm install
}

# 4. Patch react-native-worklets to remove std::regex dependency (fixes NDK 27 regex compile issue)
$versionUtilsFile = "C:\Mezatliyoruz_Build\node_modules\react-native-worklets\Common\cpp\worklets\Tools\VersionUtils.cpp"
if (Test-Path $versionUtilsFile) {
    Write-Host "Patching VersionUtils.cpp to remove std::regex dependency..." -ForegroundColor Yellow
    $patchedSource = @'
#include <worklets/Tools/VersionUtils.h>

#include <iostream>
#include <memory>
#include <string>

using namespace facebook;

namespace worklets {

bool matchVersion(const std::string &version1, const std::string &version2) {
  auto parseMajorMinor = [](const std::string &v, int &major, int &minor) -> bool {
    size_t dot1 = v.find('.');
    if (dot1 == std::string::npos) return false;
    size_t dot2 = v.find('.', dot1 + 1);
    if (dot2 == std::string::npos) return false;
    try {
      major = std::stoi(v.substr(0, dot1));
      minor = std::stoi(v.substr(dot1 + 1, dot2 - dot1 - 1));
      return true;
    } catch (...) {
      return false;
    }
  };

  int major1 = 0, minor1 = 0;
  int major2 = 0, minor2 = 0;
  if (parseMajorMinor(version1, major1, minor1) && parseMajorMinor(version2, major2, minor2)) {
    return major1 == major2 && minor1 == minor2;
  }
  return version1 == version2;
}

void checkJSVersion(
    jsi::Runtime &runtime,
    jsi::Value &jsVersionValue,
    const std::shared_ptr<worklets::JSLogger> &jsLogger,
    const std::string &cppVersion,
    const std::string &libraryName,
    const std::string &docsBaseUrl) {
  const auto libraryPrefix = std::string("[" + libraryName + "] ");

  if (jsVersionValue.isUndefined()) {
    jsLogger->warnOnJS(
        std::string(
            libraryPrefix +
            "C++ side failed to resolve JavaScript code "
            "version\n") +
        "See " + docsBaseUrl +
        "/guides/"
        "troubleshooting#c-side-failed-to-resolve-javascript-code-version` for "
        "more details.");
    return;
  }

  const auto jsVersion = jsVersionValue.asString(runtime).utf8(runtime);

  if (!matchVersion(cppVersion, jsVersion)) {
    jsLogger->warnOnJS(
        std::string(
            libraryPrefix +
            "Mismatch between C++ code version and "
            "JavaScript code version (") +
        cppVersion + " vs. " + jsVersion + " respectively).\n" + "See " + docsBaseUrl +
        "/guides/"
        "troubleshooting#mismatch-between-c-code-version-and-javascript-code-"
        "version` for more details.");
    return;
  }
}

}; // namespace worklets
'@
    Set-Content -Path $versionUtilsFile -Value $patchedSource -Force
    Write-Host "VersionUtils.cpp patch applied successfully." -ForegroundColor Green
}

# 4b. Patch react-native-reanimated CMakeLists.txt to explicitly link c++_shared
# Under NDK 27 with thin-LTO enabled in release, standard C++ STL symbols are not linked automatically.
$reanimatedCMake = "C:\Mezatliyoruz_Build\node_modules\react-native-reanimated\android\CMakeLists.txt"
if (Test-Path $reanimatedCMake) {
    Write-Host "Patching react-native-reanimated CMakeLists.txt for NDK 27 STL LTO linkage..." -ForegroundColor Yellow
    $content = Get-Content $reanimatedCMake
    $targetStr = "  react-native-worklets::worklets)"
    $replacementStr = "  react-native-worklets::worklets`r`n  c++_shared)"
    $content = $content -replace [regex]::Escape($targetStr), $replacementStr
    $content | Set-Content $reanimatedCMake
    Write-Host "react-native-reanimated CMakeLists.txt patch applied." -ForegroundColor Green
}

# 5. Generate Android folder fresh on C drive (prevents autolinking path mismatches)
Write-Host "Generating clean Android project files on C drive..." -ForegroundColor Cyan
if (Test-Path "C:\Mezatliyoruz_Build\android") {
    Write-Host "Removing existing C:\Mezatliyoruz_Build\android folder..."
    Remove-Item -Path "C:\Mezatliyoruz_Build\android" -Recurse -Force
}
npx expo prebuild --platform android --no-install

# 6. Patch android/build.gradle to force all C++ subprojects to link against c++_shared globally
# We use plugins.withId to avoid 'afterEvaluate' evaluation order failures.
Write-Host "Patching generated build.gradle with global CMake STL linkage..." -ForegroundColor Yellow
$rootBuildGradle = "C:\Mezatliyoruz_Build\android\build.gradle"
$globalStlPatch = @'

subprojects {
    plugins.withId("com.android.library") {
        android {
            defaultConfig {
                externalNativeBuild {
                    cmake {
                        arguments "-DANDROID_STL=c++_shared"
                    }
                }
            }
        }
    }
    plugins.withId("com.android.application") {
        android {
            defaultConfig {
                externalNativeBuild {
                    cmake {
                        arguments "-DANDROID_STL=c++_shared"
                    }
                }
            }
        }
    }
}
'@
Add-Content -Path $rootBuildGradle -Value $globalStlPatch
Write-Host "Global CMake STL patch applied successfully." -ForegroundColor Green

# 7. Create local.properties in the generated android folder (exclude ndk.dir so Gradle uses default NDK 27)
Write-Host "Creating local.properties in generated android project..."
Set-Content -Path "C:\Mezatliyoruz_Build\android\local.properties" -Value "sdk.dir=C\:\\Users\\Himmet Akar\\AppData\\Local\\Android\\Sdk"

# 8. Run Gradle Build with space-free cache directory override
Write-Host "Starting Android Release APK build..." -ForegroundColor Cyan
$env:GRADLE_USER_HOME = "C:\.gradle"
Set-Location "C:\Mezatliyoruz_Build\android"

# Clean previous build artifacts
Write-Host "Cleaning gradle build cache..."
./gradlew clean

# Build Release APK
Write-Host "Compiling release build..."
./gradlew assembleRelease

$apkPath = "C:\Mezatliyoruz_Build\android\app\build\outputs\apk\release\app-release.apk"
if (Test-Path $apkPath) {
    Write-Host "`n[SUCCESS] APK built successfully!" -ForegroundColor Green
    Write-Host "APK Location: $apkPath" -ForegroundColor Green
} else {
    Write-Error "Build finished but APK was not found at $apkPath"
}
