// Mock TRPC setup for build purposes
// This creates a minimal TRPC client that satisfies TypeScript without server dependencies

const createMockQuery = () => ({
  useQuery: (...args: any[]) => ({ data: null, isLoading: false }),
  useMutation: (...args: any[]) => ({ 
    mutate: (...args: any[]) => {}, 
    mutateAsync: (...args: any[]) => Promise.resolve({} as any),
    isLoading: false,
  }),
});

export const trpc = {
  createClient: () => ({}),
  Provider: ({ children }: any) => children,
  useContext: () => ({}),
  useUtils: () => ({}),
  
  // API routes
  auth: {
    login: createMockQuery(),
    logout: createMockQuery(),
    register: createMockQuery(),
    refreshToken: createMockQuery(),
  },
  property: {
    list: createMockQuery(),
    get: createMockQuery(),
    create: createMockQuery(),
    update: createMockQuery(),
    remove: createMockQuery(),
  },
  amenity: {
    list: createMockQuery(),
    getRecommendations: createMockQuery(),
  },
  analysis: {
    generateTenantProfile: createMockQuery(),
    recommendations: createMockQuery(),
    chat: createMockQuery(),
  },
  tenantProfile: {
    create: createMockQuery(),
    getByProperty: createMockQuery(),
    update: createMockQuery(),
    remove: createMockQuery(),
  },
};