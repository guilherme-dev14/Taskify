import api from "../api";

class FileService {
  async uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<string>('/files/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  async uploadAttachment(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<string>('/files/upload/attachment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  getAvatarUrl(filename: string): string {
    return `${api.defaults.baseURL}/files/avatar/${filename}`;
  }

  getAttachmentUrl(filename: string): string {
    return `${api.defaults.baseURL}/files/attachment/${filename}`;
  }
}

export default new FileService();