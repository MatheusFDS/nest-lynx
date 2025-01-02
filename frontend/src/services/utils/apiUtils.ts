const API_BACK = process.env.NEXT_PUBLIC_API_URL as string;

export const getApiUrl = () => {
  // Sempre retorna a URL do backend
  return API_BACK;
};
