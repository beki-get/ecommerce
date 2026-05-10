E-Commerce Backend API

A robust, scalable RESTful API built with Node.js and Express.js designed to power modern e-commerce platforms. 
This project focuses on automating the order lifecycle from secure authentication to payment processing and automated notifications.

Overview

Many local businesses still rely on manual customer management, missing out on the scalability of online ordering. 
This project provides a digital solution that streamlines the shopping experience, allowing customers to browse, cart, and pay for items from anywhere, saving time for both the business and the consumer

Tech Stack

Runtime: Node.js

Framework: Express.js – Chosen for its minimalist approach, allowing for a custom, modular folder structure optimized for separation of concerns

Database: MongoDB – A NoSQL approach for flexible schema design and rapid development iterations

Authentication: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)

Payments: Stripe API integration

Communications: Automated Email Service (Nodemailer) for verification and order status updates

Key Features

Authentication & RBAC: Secure user registration and login with differentiated permissions for Customers and Admins

Persistent Shopping Cart: Allows users to manage items in their cart with data persistence for future sessions

Order Management: Complete checkout workflow including payment verification and real-time status tracking

Stripe Integration: Secure handling of financial transactions and payment processing

Automated Notifications
  Email verification upon registration to ensure user authenticity
  
  Automated delivery confirmations sent to customers upon successful fulfillment

Project Architecture

The project follows a modular structure to maintain a clean separation of concerns

Controllers: Handling request logic

Models: Defining data schemas for MongoDB

Routes: Defining API endpoints

Middleware: Handling authentication, error logging, and validation

Installation & Setup

1.Clone the repository: git clone https://github.com/your-username/your-repo-name.git

2.Navigate to working directory : cd your-repo-name

3.Install dependencies:  npm install

4.Environment Configuration: Create a .env file in the root directory and add your credentials






