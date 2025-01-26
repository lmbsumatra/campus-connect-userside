import item1 from "./item_1.png";
import item2 from "./item_2.png";
import item3 from "./item_3.png";
import item4 from "./item_4.png";
import item5 from "./item_5.png";
import item6 from "./item_6.png";
import item7 from "./item_7.png";
import item8 from "./item_8.png";
export // Step Descriptions with 3D model paths
const stepDescriptions = [
  {
    subText: "Need to read for an exam?",
    headerText: (
      <h1 className="headline white">
        Rent a <span className="text-highlight wavy-underline">book</span> here
        and ace that test!
      </h1>
    ),
    paragraph:
      "Accessing books has never been easier. Get the textbooks you need, save money, and focus on what matters most—your grades.",
    image: item1,
    modelPath: "/models/book_stack.glb", // Replace with your local model path
  },
  {
    subText: "Worried about acing that lab?",
    headerText: (
      <h1 className="headline white">
        Rent{" "}
        <span className="text-highlight wavy-underline">lab equipment</span>,
        relax, and ace that lab!
      </h1>
    ),
    paragraph:
      "Say goodbye to lab stress with affordable rentals. Get the gear you need to experiment confidently and perform your best in class.",
    image: item2,
    modelPath: "/models/lab_beaker.glb", // Replace with your local model path
  },
  {
    subText: "Stressed about tough equations?",
    headerText: (
      <h1 className="headline white">
        Rent a{" "}
        <span className="text-highlight wavy-underline">
          scientific calculator
        </span>{" "}
        and solve them with ease!
      </h1>
    ),
    paragraph:
      "Tackle complex calculations with ease by renting a reliable scientific calculator. Keep your budget intact while excelling in math or science.",
    image: item3,
    modelPath: "/models/calculator.glb", // Replace with your local model path
  },
  {
    subText: "Want to play some tunes?",
    headerText: (
      <h1 className="headline white">
        Rent a <span className="text-highlight wavy-underline">guitar</span> and
        unleash your inner musician!
      </h1>
    ),
    paragraph:
      "Explore your musical talents without breaking the bank. Renting a guitar is the perfect way to start your musical journey today.",
    image: item4,
    modelPath: "/models/book_stack.glb", // Replace with your local model path
  },
  {
    subText: "Have spare tech lying around?",
    headerText: (
      <h1 className="headline white">
        Share your <span className="text-highlight wavy-underline">laptop</span>{" "}
        and earn extra cash (and good karma).
      </h1>
    ),
    paragraph:
      "Turn unused gadgets into a source of income. Lend your laptop to someone in need and make a difference.",
    image: item5,
    modelPath: "/models/book_stack.glb", // Replace with your local model path
  },
  {
    subText: "Got unused sports gear?",
    headerText: (
      <h1 className="headline white">
        Lend your{" "}
        <span className="text-highlight wavy-underline">badminton racket</span>{" "}
        and let others enjoy it!
      </h1>
    ),
    paragraph:
      "Help others stay active while earning some extra money. Share your badminton racket and give it a new purpose.",
    image: item6,
    modelPath: "/models/book_stack.glb", // Replace with your local model path
  },
  {
    subText: "Thinking of decluttering?",
    headerText: (
      <h1 className="headline white">
        Sell your old{" "}
        <span className="text-highlight wavy-underline">clothes</span> and fund
        your next fashion find!
      </h1>
    ),
    paragraph:
      "Make room for new trends by selling your gently used clothes. Help the environment and your wallet at the same time.",
    image: item7,
    modelPath: "/models/book_stack.glb", // Replace with your local model path
  },
  {
    subText: "Dreaming of new tech?",
    headerText: (
      <h1 className="headline white">
        Buy a pre-loved{" "}
        <span className="text-highlight wavy-underline">tablet</span> and save
        your budget!
      </h1>
    ),
    paragraph:
      "Upgrade to a better device without overspending. Pre-loved tablets offer great value and functionality for students like you.",
    image: item8,
    modelPath: "/models/book_stack.glb", // Replace with your local model path
  },
];
