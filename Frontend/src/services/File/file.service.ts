import api from "../api";

class FileService {
  async uploadAttachment(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<string>(
      "/files/upload/attachment",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  }
  getAttachmentUrl(filename: string): string {
    return `${api.defaults.baseURL}/files/attachment/${filename}`;
  }
}

export default new FileService();
