# Time Statistic Analyzer API Contract

**Base URL**: `http://127.0.0.1:8000`

## 1. Categories

### 1.1 Create Category

Create a new category for tracking time.

- **Endpoint**: `POST /categories/`
- **Request Body**: `application/json`

  ```json
  {
    "key": "work",          // Unique identifier (required)
    "name": "Work",         // Display name (required)
    "color": "#FF0000",     // Hex color code (optional)
    "is_active": true       // Default: true (optional)
  }
  ```

- **Response**: `200 OK`

  ```json
  {
    "id": 1,
    "key": "work",
    "name": "Work",
    "color": "#FF0000",
    "is_active": true
  }
  ```

### 1.2 List Categories

Get a list of all categories.

- **Endpoint**: `GET /categories/`
- **Query Parameters**:
  - `active_only` (boolean, default: `true`): If `true`, returns only active categories. If `false`, returns all.
- **Response**: `200 OK`

  ```json
  [
    {
      "id": 1,
      "key": "work",
      "name": "Work",
      "color": "#FF0000",
      "is_active": true
    },
    {
      "id": 2,
      "key": "study",
      "name": "Study",
      "color": "#0000FF",
      "is_active": false
    }
  ]
  ```

### 1.3 Update Category

Update an existing category's details.

- **Endpoint**: `PUT /categories/{category_id}`
- **Request Body**: `application/json` (All fields optional)

  ```json
  {
    "name": "Deep Work",
    "color": "#AA0000",
    "is_active": true
  }
  ```

- **Response**: `200 OK`

  ```json
  {
    "id": 1,
    "key": "work",
    "name": "Deep Work",
    "color": "#AA0000",
    "is_active": true
  }
  ```

### 1.4 Delete Category (Logical)

Deactivates a category (sets `is_active` to `false`). It does not remove historical data.

- **Endpoint**: `DELETE /categories/{category_id}`
- **Response**: `200 OK`

  ```json
  {
    "ok": true,
    "message": "Category deactivated"
  }
  ```

---

## 2. Timer

### 2.1 Get Current Session

Check if a timer is currently running.

- **Endpoint**: `GET /current`
- **Response**: `200 OK`
  - If running:

    ```json
    {
      "start_time": "2023-10-27T10:00:00.123456",
      "category_key": "work"
    }
    ```

  - If not running: `null`

### 2.2 Start Timer

Start a new timing session. Fails if a timer is already running.

- **Endpoint**: `POST /start`
- **Request Body**: `application/json`

  ```json

  {
    "category_key": "work" // Optional. If omitted, session is uncategorized.
  }
  ```

- **Response**: `200 OK`

  ```json
  {
    "start_time": "2023-10-27T10:00:00.123456",
    "category_key": "work"
  }
  ```

### 2.3 Update Current Session

Change the category of the currently running timer.

- **Endpoint**: `PUT /current`
- **Request Body**: `application/json`

  ```json
  {
    "category_key": "study"
  }
  ```

- **Response**: `200 OK`

  ```json
  {
    "start_time": "2023-10-27T10:00:00.123456",
    "category_key": "study"
  }
  ```

### 2.4 Stop Timer

Stop the current timer and save the record to the database. This creates a **Snapshot** of the category details at this moment.

- **Endpoint**: `POST /stop`
- **Response**: `200 OK`

  ```json
  {
    "id": 101,
    "start_time": "2023-10-27T10:00:00.123456",
    "end_time": "2023-10-27T11:00:00.123456",
    "duration_seconds": 3600,
    "date": "2023-10-27",
    "category_key": "work",
    "category_name": "Work",       // Snapshot: Name at time of recording
    "category_color": "#FF0000",   // Snapshot: Color at time of recording
    "created_at": "2023-10-27T11:00:00.123456"
  }
  ```

---

## 3. Statistics

### 3.1 Daily Stats

Get statistics for a specific day.

- **Endpoint**: `GET /stats/daily`
- **Query Parameters**:
  - `date` (string, YYYY-MM-DD, default: today)
- **Response**: `200 OK`

  ```json
  {
    "date": "2023-10-27",
    "total_seconds": 7200,
    "total_minutes": 120.0,
    "total_hours": 2.0,
    "breakdown": {
      "Work": 3600,
      "Study": 3600,
      "Uncategorized": 0
    }
  }
  ```

### 3.2 Range Stats

Get statistics for a date range.

- **Endpoint**: `GET /stats/range`
- **Query Parameters**:
  - `start` (string, YYYY-MM-DD, required)
  - `end` (string, YYYY-MM-DD, required)
- **Response**: `200 OK`

  ```json
    {
    "start_date": "2023-10-01",
    "end_date": "2023-10-31",
    "total_seconds": 36000,
    "total_minutes": 600.0,
    "total_hours": 10.0,
    "breakdown": {
      "Work": 20000,
      "Study": 16000
    },
    "daily_trend": {
      "2023-10-01": 3600,
      "2023-10-02": 7200
      // ...
    }
  }
  ```
