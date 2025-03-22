# API Documentation

## 1. Authentication

### 1.1 User Signup

**Endpoint:** POST /kind-remind/signup

**Request Body:**

```json
{
  "username": "exampleUser",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "User created successfully",
  "redirect": true
}
```

**Errors:**

- 400 - Missing required fields

```json
{
  "status": "error",
  "message": "Username, email, and password are required",
  "redirect": false
}
```

- 400 - User already exists

```json
{
  "status": "error",
  "message": "User already exists",
  "redirect": true
}
```

- 500 - Server error during signup

```json
{
  "status": "error",
  "message": "Error signing up",
  "redirect": false
}
```

---

### 1.2 User Login

**Endpoint:** POST /kind-remind/login

**Request Body:**

```json
{
  "username": "exampleUser",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Login successful",
  "userId": 1,
  "accessToken": "jwt_access_token",
  "redirect": true
}
```

**Errors:**

- 400 - Missing username or password

```json
{
  "status": "error",
  "message": "Username and password are required",
  "userId": null,
  "accessToken": null,
  "redirect": false
}
```

- 400 - User does not exist

```json
{
  "status": "error",
  "message": "User does not exist",
  "userId": null,
  "accessToken": null,
  "redirect": false
}
```

- 400 - Invalid username or password

```json
{
  "status": "error",
  "message": "Invalid username or password",
  "userId": null,
  "accessToken": null,
  "redirect": false
}
```

- 500 - Server error during login

```json
{
  "status": "error",
  "message": "Error logging in",
  "userId": null,
  "accessToken": null,
  "redirect": false
}
```

---

### 1.3 User Logout

**Endpoint:** POST /kind-remind/logout

**Response:**

```json
{
  "status": "success",
  "message": "Logout successful",
  "redirect": true
}
```

**Errors:**

- 500 - Server error during logout

```json
{
  "status": "error",
  "message": "Error logging out",
  "redirect": false
}
```

---

## 2. JWT Token Handling

### 2.1 Access Token Verification

- Requests must include an Authorization header:

Authorization: Bearer jwt_access_token

- If the access token is expired but a valid refresh token exists, a new access token is issued.
- If both tokens are invalid or missing, a 401 Unauthorized error is returned.

### 2.2 Token Refresh

**Errors:**

- 401 - Missing access token
- 401 - Missing refresh token
- 403 - Invalid refresh token

---

## 3. Protected Routes

### 3.1 Home, Tasks, and Messages Pages

These three endpoints share the same response structure, with only the message field differing for each page.

Home Page
Endpoint: GET /kind-remind/home
Endpoint: GET /kind-remind/tasks
Endpoint: GET /kind-remind/messages

**Response:**

```json
{
  "status": "success",
  "message": "Welcome to your home page 1",
  "userId": 1,
  "accessToken": "jwt_access_token",
  "newAccessToken": "new_jwt_access_token",
  "redirect": false
}
```
**Errors:**
- 401 - User ID not found in token
- 403 - Invalid or expired token

```json
{
  "status": "error",
  "message": "User ID not found in token",
  "userId": null,
  "accessToken": null,
  "newAccessToken": null,
  "redirect": true,
}
```
---
