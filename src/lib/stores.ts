/**
 * Store directory.
 *
 * Six rows that change once a decade don't earn a database table or an admin
 * screen — this file is the source of truth for the stores page and footer.
 */
export const STORES = [
  {
    name: "Connaught Place",
    address: "M-42, Outer Circle, Connaught Place, New Delhi 110001",
    phone: "+91 11 2341 2345",
    hours: "Mon–Sat 10:30–20:00 · Sun 11:00–18:00",
    flagship: true,
  },
  {
    name: "South Extension",
    address: "D-12, South Extension Part II, New Delhi 110049",
    phone: "+91 11 2625 8890",
    hours: "Mon–Sun 11:00–20:30",
  },
  {
    name: "Khan Market",
    address: "58-A, Middle Lane, Khan Market, New Delhi 110003",
    phone: "+91 11 2469 7712",
    hours: "Mon–Sat 11:00–20:00 · Sun closed",
  },
  {
    name: "DLF CyberHub, Gurugram",
    address: "Ground Floor, DLF CyberHub, DLF Phase 2, Gurugram 122002",
    phone: "+91 124 421 6650",
    hours: "Mon–Sun 11:00–22:00",
  },
  {
    name: "Sector 18, Noida",
    address: "A-24, Sector 18 Market, Noida 201301",
    phone: "+91 120 434 7781",
    hours: "Mon–Sun 11:00–21:00",
  },
  {
    name: "Rajouri Garden",
    address: "J-4/61, Rajouri Garden Main Market, New Delhi 110027",
    phone: "+91 11 2543 9920",
    hours: "Mon–Sun 11:00–20:30",
  },
] as const;
