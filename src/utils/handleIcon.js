export function handleIcon(description = "") {
  const text = description.toLowerCase()

  if (text.includes("clear")) {
    return "https://openweathermap.org/payload/api/media/file/01d.png"
  }

  if (text.includes("few clouds")) {
    return "https://openweathermap.org/payload/api/media/file/02d.png"
  }

  if (text.includes("scattered")) {
    return "https://openweathermap.org/payload/api/media/file/03d.png"
  }

  if (text.includes("broken") || text.includes("overcast")) {
    return "https://openweathermap.org/payload/api/media/file/04d.png"
  }

  if (text.includes("shower")) {
    return "https://openweathermap.org/payload/api/media/file/09d.png"
  }

  if (text.includes("rain") || text.includes("drizzle")) {
    return "https://openweathermap.org/payload/api/media/file/10d.png"
  }

  if (text.includes("thunder")) {
    return "https://openweathermap.org/payload/api/media/file/11d.png"
  }

  if (text.includes("snow")) {
    return "https://openweathermap.org/payload/api/media/file/13d.png"
  }

  if (
    text.includes("mist") ||
    text.includes("fog") ||
    text.includes("haze") ||
    text.includes("smoke")
  ) {
    return "https://openweathermap.org/payload/api/media/file/50d.png"
  }

  return "https://openweathermap.org/payload/api/media/file/01d.png"
}