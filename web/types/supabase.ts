export type UserProfile = {
  id: string;
  email?: string;
  full_name?: string;
};

// Modify Message type to include user info
export type MessageWithUser = Message & {
  user: UserProfile;
};

export type Group = {
  id: string;
  name: string;
  join_key: string;
  created_by: string;
  created_at: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: string;
};

export type Message = {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
  is_deleted: boolean;
};

export interface Database {
  public: {
    Tables: {
      group: {
        Row: Group;
        Insert: {
          name: string;
          join_key: string;
          created_by?: string;
        };
        Update: {
          name?: string;
          join_key?: string;
        };
      };
      group_members: {
        Row: GroupMember;
        Insert: {
          group_id: string;
          user_id?: string;
        };
        Update: {
          group_id?: string;
          user_id?: string;
        };
      };
      messages: {
        Row: Message;
        Insert: {
          group_id: string;
          user_id?: string;
          content: string;
        };
        Update: {
          content?: string;
          is_edited?: boolean;
          is_deleted?: boolean;
        };
      };
    };
  };
}
