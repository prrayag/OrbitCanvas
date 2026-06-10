---

##  Core API Operational Network Architecture

###  Generative Node Interface Endpoints
* **POST** `/api/v1/canvas/generate-nodes`
  * **Description:** Ingests user brainstorming context prompts, hooks into the Google Gemini pipeline stream, and returns structured node layouts.
  * **Payload Request Body (JSON):**
```json
    {
      "boardId": "orbit_session_99",
      "prompt": "Build an operational workflow for a 30-seater cafe",
      "depth": 3
    }
    ```

###  Real-Time Spatial Synchronization Gateway
* **WebSocket Channel:** `connection` -> `join-room`
  * **Payload:** `{ "userId": "user_01", "roomId": "board_session_99" }`
* **WebSocket Channel:** `node-position-update`
  * **Description:** Broadcasts low-latency canvas structural state mutations across multi-user instances.
