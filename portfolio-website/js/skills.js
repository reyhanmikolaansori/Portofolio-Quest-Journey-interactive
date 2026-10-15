// Skill tree content. Each branch is drawn as a star with its skills hanging below it.
// Skills with a logo get a round badge; the rest are shown as plain labels.

const SKILLS = {
  label: "Computer Science",
  info: "Five semesters of Computer Science, covering programming, data structures, databases and web development, plus team projects where I put these skills into practice.",
  children: [
    { label: "Programming Languages", info: "The languages I've written code in through coursework, assignments and personal projects.", children: [
      { label: "C++", logo: "assets/logos/cplusplus.webp", info: "Used throughout my coursework to practise algorithms and data structures, with a focus on writing efficient code and understanding how memory and pointers work." },
      { label: "Java", logo: "assets/logos/java.svg", info: "My main language for object-oriented programming: designing classes, using inheritance and interfaces, and structuring larger programs into reusable parts." },
      { label: "Python", logo: "assets/logos/python.webp", info: "Used for quick scripts and small programs, such as processing data and automating repetitive tasks, thanks to its simple, readable syntax." },
      { label: "JavaScript", logo: "assets/logos/javascript.webp", info: "Used to make web pages interactive: responding to clicks and input, updating content on the page, and adding animations, including on this portfolio." },
      { label: "PHP", logo: "assets/logos/php.webp", info: "Server-side scripting for web applications running on Apache, such as handling form submissions and reading or writing data in a MySQL database." },
      { label: "SQL", logo: "assets/logos/sql.webp", info: "Writing queries to create tables and to insert, select, update and delete data, including filtering, sorting and joining related tables." },
    ]},
    { label: "CS Fundamentals", info: "The core courses of my degree, in the order I took them.", children: [
      { label: "Algorithm & Programming", info: "My first programming course: breaking problems into steps, using variables, conditions, loops and functions, and turning that logic into working code." },
      { label: "Object-Oriented Programming", info: "Organising code into classes and objects, using encapsulation, inheritance and polymorphism to make programs easier to extend and maintain." },
      { label: "Data Structures", info: "How data is stored and organised, including arrays, linked lists, stacks, queues, trees and graphs, and choosing the right one for a problem." },
      { label: "Database Systems", info: "How relational databases work: modelling data into tables, normalising them to avoid duplication, and querying them with SQL." },
    ]},
    { label: "Web Development", info: "Building websites, from page structure and styling to interactivity.", children: [
      { label: "HTML5 & CSS3", logo: "assets/logos/htmlcss.webp", info: "Structuring pages with semantic HTML and styling them with CSS, including layouts with Flexbox and Grid, colours, fonts and simple animations." },
      { label: "DOM Manipulation", info: "Using JavaScript to find elements on a page and change them while it's open, for example showing, hiding or updating content when the user interacts." },
      { label: "Form Validation", info: "Checking what users type into forms before it's submitted, such as required fields, email format and matching passwords, and showing clear error messages." },
      { label: "Sliders & Product Filters", info: "Building interactive components like image sliders with next and previous controls, and filters that show only the items matching a chosen category." },
      { label: "Responsive Layouts", info: "Designing pages that adapt to different screen sizes, so the layout works well on phones, tablets and desktops." },
      { label: "Multi-page Websites", info: "Structuring a site across several pages with consistent navigation, a shared header and footer, and links that tie the pages together." },
    ]},
    { label: "Databases & Servers", info: "Storing data and running web applications on my own computer.", children: [
      { label: "MySQL", logo: "assets/logos/mysql.webp", info: "Creating databases and tables in MySQL and managing their data, often through phpMyAdmin while building web apps locally." },
      { label: "Tables & Relationships", info: "Setting up tables with primary keys, and linking related tables with foreign keys, such as connecting users to their orders." },
      { label: "XAMPP", logo: "assets/logos/xampp.webp", info: "Running Apache, MySQL and PHP together on my own computer to build and test web applications before putting them online." },
    ]},
    { label: "Blockchain", info: "Experience from FundChain, where I work on the blockchain integration.", children: [
      { label: "Smart Contract Integration", info: "Connecting FundChain's backend to a smart contract on the Sepolia test network, so the app can write records to the blockchain and read them back." },
      { label: "Transaction Relaying", info: "As FundChain's relayer, signing and submitting blockchain transactions on behalf of the app, so users don't need their own crypto wallet." },
      { label: "Cryptographic Hashing", info: "Turning data into a fixed fingerprint with hash functions like SHA-256 and Keccak-256, so any later change to the data can be detected." },
      { label: "On-chain Data Integrity", info: "Comparing records in the database with the hashes stored on the blockchain to check whether any data was altered after it was saved." },
    ]},
    { label: "Tools", info: "The tools I use every day to write, track and design my work.", children: [
      { label: "Git & GitHub", logo: "assets/logos/git.webp", info: "Tracking changes to my code with Git, and using GitHub to store projects online, share them and work on the same codebase with others." },
      { label: "VS Code", logo: "assets/logos/vscode.webp", info: "My main code editor, which I use with extensions for formatting, live previews and Git integration." },
      { label: "Figma", logo: "assets/logos/figma.webp", info: "Sketching wireframes and UI mock-ups to plan a page's layout and look before I start coding it." },
    ]},
    { label: "Teamwork & Process", info: "How I work with others on projects.", children: [
      { label: "Agile Sprints (Trello)", logo: "assets/logos/trello.webp", info: "Working in sprints on FundChain, with tasks planned, assigned and tracked on a Trello board so the team always knows what's in progress." },
      { label: "Collaboration on GitHub", logo: "assets/logos/git.webp", info: "Working in a shared repository with teammates: pulling the latest changes, committing my own work and keeping the project in sync." },
    ]},
  ],
};
