interface Group {
  id: string;
  name: string;
  join_key: string;
  created_at: string;
  created_by: string;
}

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
}

interface Message {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string;
  };
}

// utils/generate-key.ts
function generateJoinKey(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
