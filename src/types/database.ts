export interface User {
  id: string;
  auth_id: string;
  nickname: string;
  neighborhood: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  breed: string | null;
  age_months: number | null;
  size: PetSize | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export type PetSize = 'small' | 'medium' | 'large';

export interface Walk {
  id: string;
  user_id: string;
  pet_id: string | null;
  started_at: string;
  ended_at: string | null;
  distance_meters: number;
  duration_seconds: number;
  route_geojson: RouteGeoJSON | null;
  share_card_url: string | null;
  status: WalkStatus;
  created_at: string;
}

export type WalkStatus = 'active' | 'completed' | 'cancelled';

export interface RouteGeoJSON {
  type: 'LineString';
  coordinates: [number, number][];
}

export interface Tag {
  id: string;
  user_id: string;
  tag_type: TagType;
  description: string | null;
  location: { lat: number; lng: number };
  helpful_count: number;
  is_active: boolean;
  created_at: string;
  expires_at: string;
}

export type TagType =
  | 'shade'
  | 'water'
  | 'danger'
  | 'big_dog'
  | 'off_leash'
  | 'traffic'
  | 'scenic'
  | 'pet_friendly'
  | 'trash_bin';

export interface TagVote {
  id: string;
  tag_id: string;
  user_id: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      mw_users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id'>>;
        Relationships: [];
      };
      mw_pets: {
        Row: Pet;
        Insert: Omit<Pet, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Pet, 'id'>>;
        Relationships: [];
      };
      mw_walks: {
        Row: Walk;
        Insert: Omit<Walk, 'id' | 'created_at'>;
        Update: Partial<Omit<Walk, 'id'>>;
        Relationships: [];
      };
      mw_tags: {
        Row: Tag;
        Insert: Omit<Tag, 'id' | 'created_at'>;
        Update: Partial<Omit<Tag, 'id'>>;
        Relationships: [];
      };
      mw_tag_votes: {
        Row: TagVote;
        Insert: Omit<TagVote, 'id' | 'created_at'>;
        Update: never;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
