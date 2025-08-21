import type { Course } from "../types/types";

export const COURSE: Course = {
  name: "Pinus Golf",
  holes: [
    {
      name: "Kolsåstoppen",
      number: 1,
      par: 3,
      description: "Elsket og hatet.",
    },
    { name: "Kløfta", number: 2, par: 3, description: "Her må ballen løftes" },
    {
      name: "Månetoppen",
      number: 3,
      par: 3,
      description: "Høyt utslag, kan gå alle veier",
    },
    {
      name: "Australia",
      number: 4,
      par: 3,
      description: "Størst mulighet for hole in one",
    },
    {
      name: "Steinkjer",
      number: 5,
      par: 3,
      description: "Kjent for å være utfordrende",
    },
  ],
};
