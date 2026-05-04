{
  "name": "Task",
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "status": {
      "type": "string",
      "enum": [
        "todo",
        "in_progress",
        "done"
      ],
      "default": "todo"
    },
    "priority": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high"
      ],
      "default": "medium"
    },
    "category": {
      "type": "string",
      "enum": [
        "work",
        "health",
        "learning",
        "personal",
        "habit"
      ],
      "default": "personal"
    },
    "due_date": {
      "type": "string",
      "format": "date"
    },
    "goal_id": {
      "type": "string"
    },
    "ai_generated": {
      "type": "boolean",
      "default": false
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













