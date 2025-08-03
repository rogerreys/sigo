import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

// Tipos para TypeScript
type Tables = Database["public"]["Tables"];
type WorkOrder = Tables["work_orders"]["Row"] & {
  clients?: Tables["clients"]["Row"];
  work_order_items?: (Tables["work_order_items"]["Row"] & {
    products?: Tables["products"]["Row"];
  })[];
};

// Configuración de Supabase
const supabaseUrl =
  process.env.PUBLIC_SUPABASE_URL || "https://acwppojhvjykdalquhhd.supabase.co";
const supabaseAnonKey =
  process.env.PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjd3Bwb2podmp5a2RhbHF1aGhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODE3OTMsImV4cCI6MjA2NDY1Nzc5M30.qsLT0hgW4vHje_UkWk1Yh8jL4zID4mb3tmp1GqttSwM";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper para manejar errores comunes
const handleError = (error: any, context: string) => {
  console.error(`Error en ${context}:`, error);
  return { data: null, error };
};

// Servicios específicos para cada tabla
export const authService = {
  // Iniciar sesión con email y contraseña
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "signIn");
    }
  },

  // Cerrar sesión
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return handleError(error, "signOut");
    }
  },

  // Obtener sesión actual
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "getSession");
    }
  },

  // Obtener usuario actual
  getUser: () => {
    return supabase.auth.getUser();
  },
};

// Servicio para clientes
export const clientService = {
  // Obtener todos los clientes del usuario actual
  getAll: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("last_name", { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "clientService.getAll");
    }
  },

  // Obtener un cliente por ID
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "clientService.getById");
    }
  },

  // Crear un nuevo cliente
  create: async (
    clientData: Omit<
      Tables["clients"]["Insert"],
      "id" | "user_id" | "created_at" | "updated_at"
    >
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("clients")
        .insert([{ ...clientData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "clientService.create");
    }
  },

  // Actualizar un cliente
  update: async (
    id: string,
    clientData: Partial<Tables["clients"]["Update"]>
  ) => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .update(clientData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "clientService.update");
    }
  },

  // Eliminar un cliente
  delete: async (id: string) => {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);

      if (error) throw error;
      return { data: { success: true }, error: null };
    } catch (error) {
      return handleError(error, "clientService.delete");
    }
  },

  // Buscar clientes
  search: async (searchTerm: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase.rpc("search_clients", {
        search_term: searchTerm,
        user_uuid: user.id,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "clientService.search");
    }
  },
};

// Servicio para usuarios
export const userService = {
  // Obtener todos los usuarios del usuario actual
  getAll: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("full_name", { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "userService.getAll");
    }
  },
};

// Servicio para productos
export const productService = {
  // Obtener todos los productos del usuario actual
  getAll: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "productService.getAll");
    }
  },

  // Obtener un producto por ID
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "productService.getById");
    }
  },

  // Crear un nuevo producto
  create: async (
    productData: Omit<
      Tables["products"]["Insert"],
      "id" | "user_id" | "created_at" | "updated_at"
    >
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("products")
        .insert([{ ...productData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "productService.create");
    }
  },

  // Actualizar un producto
  update: async (
    id: string,
    productData: Partial<Tables["products"]["Update"]>
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "productService.update");
    }
  },

  // Eliminar un producto
  delete: async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      return { data: { success: true }, error: null };
    } catch (error) {
      return handleError(error, "productService.delete");
    }
  },

  // Buscar productos
  search: async (searchTerm: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase.rpc("search_products", {
        search_term: searchTerm,
        user_uuid: user.id,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "productService.search");
    }
  },
};

// Servicio para profiles
export const profileService = {
  // Obtener todos los perfiles (solo para administradores)
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "profileService.getAll");
    }
  },

  // Obtener perfiles del mismo grupo
  getGroupMembers: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Primero obtenemos el grupo del usuario actual
      const { data , error } = await supabase
        .from("profiles")
        .select("group_id")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "profileService.getGroupMembers");
    }
  },

  // Obtener perfil por ID
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, roles(*), groups(*)")
        .eq("id", id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "profileService.getById");
    }
  },

  // Obtener perfil del usuario actual
  getCurrentUserProfile: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data, error } = await supabase
        .from("profiles")
        .select("*, roles(*), groups(*)")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "profileService.getCurrentUserProfile");
    }
  },

  // Crear un nuevo perfil
  create: async (
    profileData: Omit<
      Tables["profiles"]["Insert"],
      "id" | "created_at" | "updated_at"
    >
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Verificar si el usuario tiene permiso para asignar el grupo
      if (profileData.group_id) {
        const { data: currentUser } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // Solo administradores pueden asignar grupos
        if (currentUser?.role !== "admin") {
          delete profileData.group_id;
        }
      }

      const { data, error } = await supabase
        .from("profiles")
        .insert({
          ...profileData,
          id: user.id, // Usar el ID del usuario autenticado
          email: user.email || "", // Asegurar que el email esté presente
        })
        .select("*, roles(*), groups(*)")
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "profileService.create");
    }
  },

  // Actualizar un perfil
  update: async (
    id: string,
    profileData: Partial<Tables["profiles"]["Update"]>
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Verificar permisos
      const { data: currentUser } = await supabase
        .from("profiles")
        .select("role, group_id")
        .eq("id", user.id)
        .single();

      // Solo administradores pueden cambiar roles y grupos
      if (currentUser?.role !== "admin") {
        delete profileData.role_id;
        delete profileData.group_id;
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*, roles(*), groups(*)")
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "profileService.update");
    }
  },

  // Eliminar un perfil (solo para administradores)
  delete: async (id: string) => {
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return handleError(error, "profileService.delete");
    }
  },

  // Actualizar el grupo de un usuario
  updateUserGroup: async (userId: string, groupId: string | null) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          group_id: groupId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select("*, roles(*), groups(*)")
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "profileService.updateUserGroup");
    }
  },
};
// Servicio para roles
export const roleService = {
  // Obtener todos los roles
  getAll: async () => {
    try {
      const { data, error } = await supabase.from("roles").select("*");
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "roleService.getAll");
    }
  },
};

// Servicio para órdenes de trabajo
export const workOrderService = {
  // Obtener todas las órdenes de trabajo del usuario actual
  getAll: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");
      const { data: groupMembers } = await profileService.getGroupMembers();
      const groupId = groupMembers?.group_id;
      
      if (!groupId) throw new Error("El usuario no pertenece a ningún grupo");

      const { data, error } = await supabase
        .from("work_orders")
        .select("*")
        .eq("user_id", user.id)
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data: data as unknown as WorkOrder[], error: null };
    } catch (error) {
      return handleError(error, "workOrderService.getAll");
    }
  },

  // Obtener una orden de trabajo por ID
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("work_orders")
        .select(
          `
          *,
          clients (*),
          work_order_items (
            *,
            products (*)
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return { data: data as unknown as WorkOrder, error: null };
    } catch (error) {
      return handleError(error, "workOrderService.getById");
    }
  },

  // Crear una nueva orden de trabajo
  create: async (
    orderData: Omit<
      Tables["work_orders"]["Insert"],
      | "id"
      | "user_id"
      | "group_id"
      | "completed_at"
      | "discount_amount"
      | "priority"
      | "created_at"
      | "updated_at"
      | "status"
    >
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data: groupMembers } = await profileService.getGroupMembers();
      const groupId = groupMembers?.group_id;

      if (!groupId) {
        throw new Error("No se pudo determinar el grupo del usuario");
      }

      // Create the work order data with all required fields and defaults
      const now = new Date().toISOString();
      const { work_order_items_id, ...orderDataWithoutItems } = orderData as any;
      
      const workOrderData: Omit<Tables["work_orders"]["Insert"], 'work_order_items_id'> & { work_order_items_id?: string } = {
        ...orderDataWithoutItems,
        user_id: user.id,
        group_id: groupId,
        discount_amount: 0, // Default value
        priority: "medium", // Default value
        created_at: now,
        updated_at: now,
        completed_at: null,
      };

      const { data, error } = await supabase
        .from("work_orders")
        .insert(workOrderData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "workOrderService.create");
    }
  },

  // Actualizar una orden de trabajo
  update: async (
    id: string,
    orderData: Partial<Tables["work_orders"]["Update"]>
  ) => {
    try {
      const { data, error } = await supabase
        .from("work_orders")
        .update(orderData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "workOrderService.update");
    }
  },

  // Eliminar una orden de trabajo
  delete: async (id: string) => {
    try {
      // Primero eliminamos los ítems asociados
      const { error: itemsError } = await supabase
        .from("work_order_items")
        .delete()
        .eq("work_order_id", id);

      if (itemsError) throw itemsError;

      // Luego eliminamos la orden
      const { error } = await supabase
        .from("work_orders")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { data: { success: true }, error: null };
    } catch (error) {
      return handleError(error, "workOrderService.delete");
    }
  },

  // Actualizar el estado de una orden de trabajo
  updateStatus: async (
    id: string,
    status: "pending" | "in_progress" | "completed" | "billed" | "cancelled"
  ) => {
    try {
      const updateData: Partial<Tables["work_orders"]["Update"]> = { status };

      // Si se marca como completada, establecer la fecha de completado
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("work_orders")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "workOrderService.updateStatus");
    }
  },
};

// Servicio para ítems de órdenes de trabajo
export const workOrderItemService = {
  // Agregar un ítem a una orden de trabajo
  // Agregar un ítem a una orden de trabajo
  addItem: async (
    itemData: Omit<
      Tables["work_order_items"]["Insert"],
      | "user_id"
      | "group_id"
      | "created_at"
      | "updated_at"
    >
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data: groupMembers } = await profileService.getGroupMembers();
      if (!groupMembers?.group_id) {
        throw new Error("El usuario no pertenece a ningún grupo");
      }

      const { data, error } = await supabase
        .from("work_order_items")
        .insert([
          {
            ...itemData,
            user_id: user.id,
            group_id: groupMembers.group_id
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "workOrderItemService.addItem");
    }
  },

  // Actualizar un ítem de orden de trabajo
  updateItem: async (
    itemId: string,
    itemData: Partial<Tables["work_order_items"]["Update"]>
  ) => {
    try {
      // Si se actualiza cantidad, precio o descuento, recalcular el total
      if (
        "quantity" in itemData ||
        "unit_price" in itemData ||
        "discount_percent" in itemData
      ) {
        // Obtener el ítem actual para calcular el nuevo total
        const { data: currentItem, error: fetchError } = await supabase
          .from("work_order_items")
          .select("quantity, unit_price, discount_percent")
          .eq("id", itemId)
          .single();

        if (fetchError) throw fetchError;

        // Usar los valores actualizados o los existentes con valores por defecto
        const quantity = itemData.quantity ?? currentItem.quantity ?? 0;
        const unitPrice = itemData.unit_price ?? currentItem.unit_price ?? 0;
        const discountPercent =
          itemData.discount_percent ?? currentItem.discount_percent ?? 0;

        // Calcular nuevo total con valores por defecto seguros
        const totalPrice = quantity * unitPrice * (1 - discountPercent / 100);

        // Agregar el total calculado a los datos de actualización
        itemData.total_price = totalPrice;
      }

      const { data, error } = await supabase
        .from("work_order_items")
        .update(itemData)
        .eq("id", itemId)
        .select("*, products(*)")
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "workOrderItemService.updateItem");
    }
  },

  // Eliminar un ítem de orden de trabajo
  removeItem: async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("work_order_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      return { data: { success: true }, error: null };
    } catch (error) {
      return handleError(error, "workOrderItemService.removeItem");
    }
  },

  // Obtener los ítems de una orden de trabajo
  getItems: async (workOrderId: string) => {
    try {
      const { data, error } = await supabase
        .from("work_order_items")
        .select("*, products(*)")
        .eq("work_order_id", workOrderId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return handleError(error, "workOrderItemService.getItems");
    }
  },
};
