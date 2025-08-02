import { Database } from './supabase';

declare module '../services/groupService' {
  export interface GroupService {
    getAll: () => Promise<{
      data: Database['public']['Tables']['groups']['Row'][] | null;
      error: any;
    }>;
    
    getMyGroups: () => Promise<{
      data: Database['public']['Tables']['groups']['Row'][] | null;
      error: any;
    }>;
    
    getById: (id: string) => Promise<{
      data: Database['public']['Tables']['groups']['Row'] | null;
      error: any;
    }>;
    
    create: (groupData: Omit<Database['public']['Tables']['groups']['Insert'], 'id' | 'created_at' | 'updated_at' | 'created_by'>) => Promise<{
      data: Database['public']['Tables']['groups']['Row'] | null;
      error: any;
    }>;
    
    update: (id: string, groupData: Partial<Database['public']['Tables']['groups']['Update']>) => Promise<{
      data: Database['public']['Tables']['groups']['Row'] | null;
      error: any;
    }>;
    
    delete: (id: string) => Promise<{
      data: { success: boolean } | null;
      error: any;
    }>;
    
    getGroupMembers: (groupId: string) => Promise<{
      data: Database['public']['Tables']['profiles']['Row'][] | null;
      error: any;
    }>;
    
    addUserToGroup: (userId: string, groupId: string) => Promise<{
      data: Database['public']['Tables']['profiles']['Row'] | null;
      error: any;
    }>;
    
    removeUserFromGroup: (userId: string) => Promise<{
      data: { success: boolean } | null;
      error: any;
    }>;
    
    isGroupAdmin: (groupId: string) => Promise<boolean>;
  }

  const groupService: GroupService;
  export { groupService };
}
