# Gray Zone Frontend (Blazor Server)

A modern Steam-like storefront built with **Blazor Server** and **MudBlazor**. This project demonstrates a dynamic catalog, interactive cart, and checkout workflow, fully integrated with a RESTful backend.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Functionalities](#core-functionalities)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Documentation](#documentation)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## Features

- Dynamic product catalog (Razor components)
- Interactive cart: add/remove/update items, total calculation
- Checkout form with client-side validation
- Asynchronous backend integration via `HttpClient`
- Reusable components: `ProductCard`, `CartItem`, `Loader`
- Responsive UI with MudBlazor grids
- Snackbars, alerts, dialogs for user feedback

---

## Tech Stack

- **Framework:** Blazor Server (.NET 9)
- **UI Library:** MudBlazor
- **Styling:** MudBlazor (Bootstrap optional)
- **Backend Communication:** HttpClient (REST API)
- **Validation:** DataAnnotations, MudBlazor MudForm
- **Async:** Async/Await for all backend calls

---

## Project Structure

```
SteamClone.Frontend/
├── Components/
│   ├── Layout/
│   │   ├── MainLayout.razor
│   │   ├── MainLayout.razor.css
│   │   └── NavMenu.razor
│   ├── Pages/
│   │   ├── Catalog.razor
│   │   ├── Cart.razor
│   │   ├── Checkout.razor
│   │   └── Login.razor
│   └── App.razor
├── Models/
│   ├── GameResponseDTO.cs
│   ├── CartItemDto.cs
│   └── CheckoutModel.cs
├── Services/
│   ├── CatalogService.cs
│   ├── CartService.cs
│   └── OrderService.cs
├── wwwroot/
│   └── app.css
├── Program.cs
├── SteamClone.Frontend.csproj

```

---

## Core Functionalities

### Catalog

- Fetches product list from backend
- Displays products with `MudCard` and `MudGrid`
- Add to cart functionality

### Cart

- Dynamic cart item display
- Update quantity/remove items
- Subtotal/total calculation
- Feedback via MudBlazor snackbar/alert

### Checkout

- Validated form: name, email, address, payment (dummy)
- Async submission to backend
- Confirmation dialogs

### Backend Integration

- `CatalogService`: GET products
- `CartService`: Add/remove/fetch cart items
- `OrderService`: POST checkout data
- All calls are async with error handling

### UI & Interaction

- Responsive layout
- Dynamic cart count in navigation
- MudBlazor snackbars/alerts for feedback

---
