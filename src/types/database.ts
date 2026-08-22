/**
 * TypeScript definitions for Supabase Database Schema
 * Standard Supabase JS v2 compatible structure
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      devices: {
        Row: {
          id: string
          hostname: string
          ip_address: string
          mac_address: string
          os: string
          device_type: 'Workstation' | 'Server' | 'Laptop' | 'IoT' | 'Router' | 'Firewall' | 'Cloud' | 'External'
          department: string
          owner: string
          status: 'HEALTHY' | 'SUSPICIOUS' | 'COMPROMISED' | 'ISOLATED' | 'OFFLINE'
          risk_score: number
          compromise_probability: number
          anomalies: string[]
          is_isolated: boolean
          isolated_at: string | null
          isolated_by: string | null
          isolation_reason: string | null
          inbound_bytes: number
          outbound_bytes: number
          dns_queries_per_min: number
          failed_logins_24h: number
          active_connections: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          hostname: string
          ip_address: string
          mac_address?: string
          os?: string
          device_type?: 'Workstation' | 'Server' | 'Laptop' | 'IoT' | 'Router' | 'Firewall' | 'Cloud' | 'External'
          department?: string
          owner?: string
          status?: 'HEALTHY' | 'SUSPICIOUS' | 'COMPROMISED' | 'ISOLATED' | 'OFFLINE'
          risk_score?: number
          compromise_probability?: number
          anomalies?: string[]
          is_isolated?: boolean
          isolated_at?: string | null
          isolated_by?: string | null
          isolation_reason?: string | null
          inbound_bytes?: number
          outbound_bytes?: number
          dns_queries_per_min?: number
          failed_logins_24h?: number
          active_connections?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hostname?: string
          ip_address?: string
          mac_address?: string
          os?: string
          device_type?: 'Workstation' | 'Server' | 'Laptop' | 'IoT' | 'Router' | 'Firewall' | 'Cloud' | 'External'
          department?: string
          owner?: string
          status?: 'HEALTHY' | 'SUSPICIOUS' | 'COMPROMISED' | 'ISOLATED' | 'OFFLINE'
          risk_score?: number
          compromise_probability?: number
          anomalies?: string[]
          is_isolated?: boolean
          isolated_at?: string | null
          isolated_by?: string | null
          isolation_reason?: string | null
          inbound_bytes?: number
          outbound_bytes?: number
          dns_queries_per_min?: number
          failed_logins_24h?: number
          active_connections?: number
          updated_at?: string
        }
        Relationships: []
      }
      threat_alerts: {
        Row: {
          id: string
          alert_code: string
          title: string
          device_id: string
          device_hostname: string
          device_ip: string
          threat_category: string
          severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
          confidence_score: number
          compromise_probability: number
          status: 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'FALSE_POSITIVE'
          summary: string
          indicators: Json
          ai_explanation: string
          remediation_steps: string[]
          assigned_analyst: string | null
          detected_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          alert_code: string
          title: string
          device_id: string
          device_hostname: string
          device_ip: string
          threat_category: string
          severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
          confidence_score?: number
          compromise_probability?: number
          status?: 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'FALSE_POSITIVE'
          summary: string
          indicators?: Json
          ai_explanation?: string
          remediation_steps?: string[]
          assigned_analyst?: string | null
          detected_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          alert_code?: string
          title?: string
          device_id?: string
          device_hostname?: string
          device_ip?: string
          threat_category?: string
          severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'
          confidence_score?: number
          compromise_probability?: number
          status?: 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'FALSE_POSITIVE'
          summary?: string
          indicators?: Json
          ai_explanation?: string
          remediation_steps?: string[]
          assigned_analyst?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      investigation_notes: {
        Row: {
          id: string
          entity_id: string
          entity_type: 'device' | 'threat' | 'incident'
          analyst_id: string | null
          analyst_name: string
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          entity_id: string
          entity_type?: 'device' | 'threat' | 'incident'
          analyst_id?: string | null
          analyst_name: string
          note: string
          created_at?: string
        }
        Update: {
          note?: string
        }
        Relationships: []
      }
      analyst_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          callsign: string
          role: string
          clearance_level: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          callsign?: string
          role?: string
          clearance_level?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string
          callsign?: string
          role?: string
          clearance_level?: string
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          action_type: string
          target_entity: string
          performed_by: string
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          action_type: string
          target_entity: string
          performed_by: string
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
export type InsertDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
