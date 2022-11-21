import {
  TutorialCategory,
  TutorialData,
  TutorialLevel,
} from "../utils/pg/tutorial/types";

const getTutorialImgSrc = (src: string) => "/tutorials/" + src;

export const TUTORIALS: TutorialData[] = [
  {
    name: "Template Tutorial",
    description: "Simple template tutorial.",
    imageSrc: getTutorialImgSrc("template/thumbnail.png"),
    authors: [
      {
        name: "acheron",
        link: "https://twitter.com/acheroncrypto",
      },
    ],
    level: TutorialLevel.BEGINNER,
    categories: [TutorialCategory.OTHER],
    elementImport: () => import("./Template"),
  },

  {
    name: "Counter PDA Tutorial",
    description:
      "Create a simple counter that will store the number of times is called.",
    imageSrc: getTutorialImgSrc("counter-easy/counter.jpg"),
    authors: [
      {
        name: "cleon",
        link: "https://twitter.com/0xCleon",
      },
    ],
    level: TutorialLevel.BEGINNER,
    categories: [TutorialCategory.ANCHOR],
    elementImport: () => import("./CounterEasy"),
  },

  {
    name: "Tiny Adventure",
    description:
      "Create a very simple on chain game. Moving a character left and right. Will be connected to Unity Game Engine later on.",
    imageSrc: getTutorialImgSrc("tiny-adventure/tinyAdventure.jpg"),
    authors: [
      {
        name: "Jonas Hahn",
        link: "https://twitter.com/solplay_jonas",
      },
    ],
    level: TutorialLevel.BEGINNER,
    categories: [TutorialCategory.ANCHOR, TutorialCategory.GAMING],
    elementImport: () => import("./TinyAdventure"),
  },

  {
    name: "Tiny Adventure Two",
    description: "Giving out sol rewards to players.",
    imageSrc: getTutorialImgSrc("tiny-adventure-two/tinyAdventureTwo.jpg"),
    authors: [
      {
        name: "Jonas Hahn",
        link: "https://twitter.com/solplay_jonas",
      },
    ],
    level: TutorialLevel.BEGINNER,
    categories: [TutorialCategory.ANCHOR, TutorialCategory.GAMING],
    elementImport: () => import("./TinyAdventureTwo"),
  },
];
