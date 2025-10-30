-- System Improvements Board Schema
CREATE TABLE IF NOT EXISTS system_improvements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('feature', 'bug', 'improvement', 'task')),
  phase TEXT,
  priority TEXT NOT NULL CHECK(priority IN ('critical', 'high', 'medium', 'low')),
  status TEXT NOT NULL CHECK(status IN ('todo', 'in_progress', 'testing', 'done', 'blocked')),
  assignedTo TEXT,
  estimatedHours REAL,
  actualHours REAL,
  relatedFiles TEXT,
  relatedBoards TEXT,
  checkboxes TEXT,
  completedCheckboxes INTEGER DEFAULT 0,
  totalCheckboxes INTEGER DEFAULT 0,
  notes TEXT,
  createdBy TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  completedAt DATETIME
);

CREATE INDEX IF NOT EXISTS idx_system_improvements_status ON system_improvements(status);
CREATE INDEX IF NOT EXISTS idx_system_improvements_phase ON system_improvements(phase);
CREATE INDEX IF NOT EXISTS idx_system_improvements_priority ON system_improvements(priority);
CREATE INDEX IF NOT EXISTS idx_system_improvements_type ON system_improvements(type);
