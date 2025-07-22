# MedGo

MedGo is a healthcare management platform designed to streamline clinic, hospital, and medical administration. It features modules for appointments, patient management, inventory, and more, with separate interfaces for admin and general users.

---


## Features

- **Patient & Appointment Management:** Register patients, schedule and track appointments.
- **Admin Dashboard:** Manage users, doctors, clinics, products, orders, and lab tests.
- **Inventory Management:** Track medicines and products.
- **Order & Billing System:** Handle orders, create and manage bills.
- **Authentication:** Secure login for admins and users.
- **Responsive UI:** Modern interfaces for both admins and users.
- **WebSocket Support:** Real-time updates for key events (backend).
- **PWA Support:** Can be installed as a Progressive Web App.

---

## Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS (client/ and Admin/)
- **Backend:** Node.js, Express.js, MongoDB (server/)
- **Other:** Docker, Firebase notifications (client/), WebSockets, RESTful APIs

---

## Folder Structure

```
MedGo/
├── Admin/                  # Admin dashboard (React app)
│   ├── src/
│   ├── index.html
│   └── ...
├── client/                 # Client-facing web app (React app)
│   ├── src/
│   ├── vite.config.js
│   └── ...
├── server/                 # Express.js backend API
│   ├── config/
│   ├── Middlewares/
│   ├── Route/
│   ├── index.js
│   ├── Dockerfile
│   └── ...
```

> **Note:** This structure is based on a partial code search. Some files/folders may not be listed. See the [GitHub repository](https://github.com/abhishekmishra0409/MedGo) for the complete structure.

---

## Installation

### Prerequisites

- Node.js & npm
- MongoDB
- (Optional) Docker

### Steps

1. **Clone the repository**
    ```bash
    git clone https://github.com/abhishekmishra0409/MedGo.git
    cd MedGo
    ```

2. **Install dependencies**
    ```bash
    cd server && npm install
    cd ../client && npm install
    cd ../Admin && npm install
    ```

3. **Environment setup**
    - Copy and configure environment variables as needed (see `.env.example` or documentation for required keys).
    - Set up MongoDB and update `MONGO_URI` in the backend.

4. **Start the backend**
    ```bash
    cd server
    npm start
    # or, for Docker:
    # docker build -t medgo-server .
    # docker run -p 5000:5000 medgo-server
    ```

5. **Start the frontend (client and admin)**
    ```bash
    cd ../client
    npm start
    # In a new terminal:
    cd ../Admin
    npm start
    ```

6. **Access the application**
    - Client: [http://localhost:3000](http://localhost:3000)
    - Admin: [http://localhost:5173](http://localhost:5173) *(or as configured)*
    - Backend API: [http://localhost:5000/api](http://localhost:5000/api)

---

## Usage

- **Admin:** Log in via the admin portal to manage users, products, orders, and more.
- **User:** Use the client app to register, book appointments, view products, and interact with healthcare services.
- **APIs:** Use `/api` endpoints for integrations.

---

## Contributing

Contributions and feature requests are welcome!  
Please open an issue or submit a pull request.

---

## License

This project is for educational and non-commercial use.  
See [LICENSE](LICENSE) for details.

---

> **For more details and the latest code/folders, visit the [GitHub repository](https://github.com/abhishekmishra0409/MedGo).**
