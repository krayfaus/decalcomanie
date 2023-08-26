# Décalcomanie: Sticker Store

## Overview

Welcome to the `Décalcomanie` demo project! This repository contains a simple application that simulates an online sticker store, allowing users to browse and purchase Colored Square stickers. This project was created to showcase my programming skills and understanding of web application concepts.

## Folder Structure

The `webpage` and `server` components are separated in different projects to allow ease of customization and the isolation of the necessary private keys. If given more time, I would further organize the projects in a shared workspace, extracting the common types and interfaces in shared components to the `webpage` and the `server`.

## Features

The demo includes the following features:

1. **Homepage**: The homepage presents a collection of randomly generated
stickers which can be added to the shopping cart.

2. **Shopping Cart**: Users can inspect their shopping cart any time through the
cart link in the navigation bar.

5. **Checkout**: After choosing their favourite color, users can proceed to the
checkout page and complete the purchase.

## Technologies Used

- **HTML**: The structure and layout of the web pages.
- **TailwindCSS**: Styling and design to create an attractive interface.
- **TypeScript**: Application dynamic behavior, with enhanced type safety.
- **React**: Component driven atomic design, with modular and reusable
components.
- **PayPal SDK**: Integration with the PayPal payment system for secure and
convenient transactions.
- **GitHub**: Version control.
- **Visual Studio Code**: Code editor used for development.
- **The Color API**: Color information for the generation of placeholde
product data.

## Deployment

The application was deployed to AWS, using a single server instance to host both
components, using the PM2 process manager to initialize and monitor the resource
consumption.
