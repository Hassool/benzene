# 🌿 Benzene

**Benzene** is a modern, open-source educational platform built to democratize high school education. It provides high-quality lessons, interactive science tools, and quizzes in a digital-first environment.

Designed to be accessible and community-driven, Benzene empowers students to learn at their own pace with tools that make complex subjects like Chemistry and Physics easier to understand.

---

## 🚀 Features

### 📚 Interactive Learning
*   **Multimedia Lessons**: Support for documents, videos, and external resources.
*   **Quizzes**: Teacher-created assessments to test knowledge.
*   **Localized Content**: Built with internationalization in mind (supports Arabic/RTL).

### 🛠️ Scientific Tools
*   **🧪 Equation Balancer**: Automatically balance chemical equations.
*   **⚖️ Unit Converter**: Convert between various scientific units.
*   **📈 Graph Drawer**: Visualize mathematical functions.
*   **⚛️ Periodic Table**: Interactive reference for elements.

### 🔐 Platform Features
*   **Secure Authentication**: NextAuth.js integration (Phone/Password & Social provider support).
*   **Role-Based Access**: Specialized dashboards for Students and Admins.
*   **Modern UI**: Built with React 19, TailwindCSS, and Framer Motion for smooth animations.

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Language**: JavaScript / React 19
*   **Styling**: [TailwindCSS](https://tailwindcss.com/)
*   **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose)
*   **Authentication**: [NextAuth.js](https://next-auth.js.org/)
*   **Media**: Cloudinary (Image/Video hosting)

---

## 🏁 Getting Started

Follow these steps to run the project locally.

### Prerequisites

*   Node.js 18+ 
*   MongoDB Instance (Local or Atlas)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/ttrak.git
    cd ttrak
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add the following variables:

    ```env
    # Database
    MONGODB_URI=mongodb+srv://...

    # Authentication
    NEXTAUTH_SECRET=your_super_secret_key
    NEXTAUTH_URL=http://localhost:3000
    
    # Admin Configuration
    ADMINS=phone_number_1,phone_number_2
    YACINE=primary_admin_phone_number
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📜 License

This project is open-source and available under the MIT License.
