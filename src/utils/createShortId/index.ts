export default () => { // Create shortId for traffic-calming petition respondents
  let id = ''
  const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnpqrstuvwxyz123456789'

  for(let i = 0; i < 5; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return id.toUpperCase()
}