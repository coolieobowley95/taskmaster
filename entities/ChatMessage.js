{
  "name": "ChatMessage",
  "type": "object",
  "properties": {
    "role": {
      "type": "string",
      "enum": [
        "user",
        "assistant"
      ]
    },
    "content": {
      "type": "string"
    },
    "session_id": {
      "type": "string"
    }
  },
  "required": [
    "role",
    "content"
  ],
  "rls": {
    "create": {
      "created_by": "{{user.email}}"
    },
    "read": {
      "created_by": "{{user.email}}"
    },
    "update": {
      "created_by": "{{user.email}}"
    },
    "delete": {
      "created_by": "{{user.email}}"
    }
  }
}