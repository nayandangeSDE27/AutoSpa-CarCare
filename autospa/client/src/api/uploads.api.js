import api from './client.js'

export const uploadsApi = {
  image: (file) => {
    const fd = new FormData()
    fd.append('image', file)
    return api.post('/uploads/image', fd).then((d) => d.url)
  },
}

export default uploadsApi
