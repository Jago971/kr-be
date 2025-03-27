# Kind Remind API Documentation

## Authentication Routes

### 1. Sign Up

-   **Endpoint:** `POST /kind-remind/signup`
-   **Description:** Registers a new user.
-   **Request Body:**
    ```json
    {
        "username": "testuser",
        "email": "test@example.com",
        "password": "securepassword"
    }
    ```
-   **Success Response:**
    -   **201 Created**
    ```json
    {
        "status": "success",
        "message": "User created successfully",
        "data": {
            "authentication": {
                "oldAccessToken": null,
                "newAccessToken": null
            },
            "payload": {
                "userId": 1
            }
        }
    }
    ```
-   **Error Responses:**
    -   **400 Bad Request** → "Username, email, and password are required"
    -   **409 Conflict** → "User already exists"
    -   **500 Internal Server Error** → "Error signing up"

---

### 2. Log In

-   **Endpoint:** `POST /kind-remind/login`
-   **Description:** Authenticates an existing user and returns a JWT token.
-   **Request Body:**
    ```json
    {
        "username": "testuser",
        "password": "securepassword"
    }
    ```
-   **Success Response:**
    -   **200 OK**
    ```json
    {
        "status": "success",
        "message": "Login successful",
        "data": {
            "authentication": {
                "oldAccessToken": null,
                "newAccessToken": "jwt_token"
            },
            "payload": {
                "userId": 1
            }
        }
    }
    ```
-   **Error Responses:**
    -   **400 Bad Request** → "Username and password are required"
    -   **400 Bad Request** → "User does not exist"
    -   **400 Bad Request** → "Invalid username or password"
    -   **500 Internal Server Error** → "Error logging in"

---

### 3. Log Out

-   **Endpoint:** `POST /kind-remind/logout`
-   **Description:** Logs out the user and clears refresh token cookies.
-   **Success Response:**
    -   **200 OK**
    ```json
    {
        "status": "success",
        "message": "Logout successful"
    }
    ```

---

## Protected Routes (Requires Authentication)

### 4. Get Home, Tasks, and Messages

-   **Endpoints:**
    -   `GET /kind-remind/home`
    -   `GET /kind-remind/tasks`
    -   `GET /kind-remind/messages`
-   **Description:** These three endpoints follow the **same structure**. The only difference is:
    -   The **URL path** (`/home`, `/tasks`, or `/messages`)
    -   The **message** in the response
-   **Headers:**
    -   `Authorization: Bearer <JWT_TOKEN>`
-   **Success Response:**
    -   **200 OK**
    ```json
    {
        "status": "success",
        "message": "Welcome to your dashboard, 1",
        "data": {
            "authentication": {
                "oldAccessToken": "jwt-token-old",
                "newAccessToken": "jwt-token-new"
            },
            "payload": {
                "userId": 123
            }
        }
    }
    ```
-   **Error Responses:**
    -   **401 Unauthorized** → "User ID not found in token"

---

## Authentication Middleware

### Token Verification

-   Middleware: `verifyAccessToken`
-   **Behavior:**
    -   Checks if the JWT token is valid.
    -   If expired, checks the refresh token and issues a new access token.
-   **Possible Errors:**
    -   **401 Unauthorized** → "Access token missing"
    -   **401 Unauthorized** → "Refresh token missing"
    -   **403 Forbidden** → "Invalid or expired token"

---
