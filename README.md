# Shinyboard

**Shinyboard** is a localized leaderboard for tracking Shiny Pokémon catches in PokeMMO. It provides an interface for team management and score tracking.

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/shinyboard.git
   cd shinyboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the board.

## 📝 Usage

### Updating the Leaderboard
Since this project uses a hardcoded JSON file for persistence, updates are managed via the built-in Admin tool:

1. Navigate to your admin page ([http://localhost:3000](http://localhost:3000)).
2. Existing JSON can be imported in the upper right hand corner.
3. The team name can be changed by clicking on it and editing.
4. Register players & add their shinies.
5. Click **Copy JSON**.
6. Replace the contents of \`src/lib/leaderboard.json\` with the copied data and commit the changes.

## 🚀 Features

* **Automated Scoring**: Dynamic calculation based on modifiers.
* **Searchable Combobox**: Quick-search interface for adding Pokémon records.
* **Animated Sprites**: Generation V style animations via PokeAPI.
* **Persistent Logic**: JSON-based data management for easy hosting and version control.

### 📊 Point System

Scores are calculated automatically based on the following weights:

| Modifier | Points |
| :--- | :--- |
| **Standard Shiny** | 10 |
| **Secret Shiny** | +50 |
| **Safari Shiny** | +20 |
| **Alpha Shiny** | +100 |

## 🛠️ Tech Stack

* **Framework**: [Next.js](https://nextjs.org/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Data Storage**: Static JSON (`/lib/leaderboard.json`)
* **Assets**: [PokeAPI](https://pokeapi.co/) (Gen V Animated Sprites)

## ⚖️ License

Pokémon and all associated names and assets are trademarks of Nintendo, Game Freak. All sprite assets are provided by the PokeAPI.
