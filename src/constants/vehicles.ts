// Brand and Model Library for Vehicles in Mezatliyoruz
export interface VehicleBrand {
  name: string;
  models: string[];
}

export const VEHICLE_BRANDS: { [category: string]: VehicleBrand[] } = {
  "Otomobil": [
    { name: "BMW", models: ["1 Serisi", "2 Serisi", "3 Serisi", "4 Serisi", "5 Serisi", "6 Serisi", "7 Serisi", "8 Serisi", "X1", "X3", "X5", "i4", "iX"] },
    { name: "Mercedes-Benz", models: ["A Serisi", "B Serisi", "C Serisi", "E Serisi", "S Serisi", "CLA", "CLS", "GLA", "GLC", "GLE", "EQE", "EQS"] },
    { name: "Audi", models: ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q5", "Q7", "e-tron"] },
    { name: "Volkswagen", models: ["Polo", "Golf", "Passat", "Tiguan", "T-Roc", "Arteon", "Touareg", "Jetta", "Scirocco"] },
    { name: "Renault", models: ["Clio", "Megane", "Captur", "Taliant", "Kadjar", "Austral", "Fluence", "Symbol"] },
    { name: "Fiat", models: ["Egea", "Panda", "500", "Linea", "Punto", "Fiorino", "Doblo"] },
    { name: "Toyota", models: ["Corolla", "Yaris", "C-HR", "RAV4", "Aurıs", "Avensis", "Land Cruiser"] },
    { name: "Honda", models: ["Civic", "City", "Accord", "Jazz", "CR-V", "HR-V"] },
    { name: "Hyundai", models: ["i10", "i20", "i30", "Elantra", "Tucson", "Kona", "Santa Fe", "Accent Era"] },
    { name: "Ford", models: ["Fiesta", "Focus", "Mondeo", "Mustang", "Puma", "Kuga", "Ranger"] },
    { name: "Opel", models: ["Corsa", "Astra", "Insignia", "Mokka", "Grandland", "Crossland"] },
    { name: "Peugeot", models: ["208", "308", "508", "2008", "3008", "5008"] },
    { name: "Diğer", models: [] }
  ],
  "Motosiklet": [
    { name: "Honda", models: ["Goldwing", "CBR 600RR", "CBR 1000RR", "PCX 125", "Activa 125", "Forza 250", "CRF 250 Rally", "Dio"] },
    { name: "Yamaha", models: ["NMAX 125", "XMAX 250", "MT-07", "MT-09", "YZF R25", "YZF R6", "YZF R1", "TMAX"] },
    { name: "BMW", models: ["R 1250 GS", "F 850 GS", "G 310 GS", "S 1000 RR", "C 400 GT", "R nineT"] },
    { name: "Vespa", models: ["Primavera", "GTS 300", "Sprint 150", "Sei Giorni", "Elettrica"] },
    { name: "Kawasaki", models: ["Ninja 400", "Ninja ZX-6R", "Ninja ZX-10R", "Z900", "Z650", "Versys 650"] },
    { name: "KTM", models: ["Duke 125", "Duke 250", "Duke 390", "Adventure 390", "RC 390", "Super Duke 1290"] },
    { name: "Suzuki", models: ["GSX-R 1000", "Hayabusa", "V-Strom 650", "Burgman 400", "Address 125"] },
    { name: "Harley-Davidson", models: ["Iron 883", "Fat Boy", "Sportster S", "Pan America", "Street Glide"] },
    { name: "Diğer", models: [] }
  ],
  "Karavan": [
    { name: "Adria", models: ["Adora", "Altea", "Aviva", "Astella"] },
    { name: "Hymer", models: ["Eriba Touring", "Eriba Nova", "Free S", "Grand Canyon"] },
    { name: "Knaus", models: ["Südwind", "Sport", "Tabbert", "Boxstar"] },
    { name: "Ortakçı", models: ["Yerli Çekme", "Yerli Alkovenli", "Yerli Motokaravan"] },
    { name: "Diğer", models: [] }
  ],
  "Kamyon, kamyonet": [
    { name: "Ford Trucks", models: ["F-Max", "Cargo 1846T", "Transit", "Ranger"] },
    { name: "Mercedes-Benz", models: ["Actros", "Axor", "Atego", "Sprinter"] },
    { name: "Scania", models: ["R 450", "S 500", "G 400", "P 360"] },
    { name: "Volvo", models: ["FH 16", "FH 500", "FM 420", "FL 240"] },
    { name: "Iveco", models: ["Daily", "Eurocargo", "Stralis", "Trakker"] },
    { name: "Diğer", models: [] }
  ],
  "Traktör ve tarım makineleri": [
    { name: "New Holland", models: ["TD5.110", "T4.75", "TT65", "TR6.120"] },
    { name: "John Deere", models: ["5075E", "6120M", "5085M", "8R 370"] },
    { name: "Massey Ferguson", models: ["MF 5711", "MF 240", "MF 5455", "MF 7715"] },
    { name: "Tümosan", models: ["8095", "8105", "8075", "4050"] },
    { name: "Case IH", models: ["Farmall 110A", "Puma 150", "JX75C"] },
    { name: "Diğer", models: [] }
  ],
  "İş makineleri (ekskavatör, forklift, vinç vb.)": [
    { name: "Caterpillar", models: ["320 Ekskavatör", "950 Yükleyici", "D6 Dozer", "DP30 Forklift"] },
    { name: "Komatsu", models: ["PC210 Ekskavatör", "WA380 Yükleyici", "D65 Dozer"] },
    { name: "JCB", models: ["3CX Beko Loder", "4CX Beko Loder", "540 Telehandler"] },
    { name: "Hidromek", models: ["HMK 220 Ekskavatör", "HMK 102B Beko Loder"] },
    { name: "Liebherr", models: ["LTM 1100 Mobil Vinç", "924 Ekskavatör"] },
    { name: "Diğer", models: [] }
  ]
};
