{
  "name": "Goal",
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "target_date": {
      "type": "string",
      "format": "date"
    },
    "status": {
      "type": "string",
      "enum": [
        "active",
        "completed",
        "paused"
      ],
      "default": "active"
    },
    "category": {
      "type": "string",
      "enum": [
        "work",
        "health",
        "learning",
        "personal"
      ],
      "default": "personal"
    }
  },
  "required": [
    "title"
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