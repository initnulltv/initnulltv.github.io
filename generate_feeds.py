import requests
import xml.etree.ElementTree as ET
import yaml
import os
import re
from unidecode import unidecode

# --- CONFIGURACIÓN ---
YOUTUBE_FEED_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=UCFQ7JSFzeTLE63luE0P-iIQ"
OUTPUT_DIR = "_data"
OUTPUT_YOUTUBE_FEED = os.path.join(OUTPUT_DIR, "youtube_feed.yml")
OUTPUT_VIDEOS = os.path.join(OUTPUT_DIR, "videos.yml")
BASE_URL = "https://initnulltv.com" # Dominio base
# URL ÚNICA DONDE RESIDEN TODOS LOS VIDEOS EN EL SITIO
MULTIMEDIA_URL = f"{BASE_URL}/multimedia/" 

# --- NAMESPACES XML ---
NS = {
    'atom': 'http://www.w3.org/2005/Atom',
    'yt': 'http://www.youtube.com/xml/schemas/2015',
    'media': 'http://search.yahoo.com/mrss/'
}

# La función create_slug se mantiene.
def create_slug(text):
    """Genera un slug SEO-friendly a partir del título."""
    text = unidecode(text).lower()
    text = re.sub(r'[^a-z0-9\s-]', '', text) 
    text = re.sub(r'[\s_-]+', '-', text).strip('-')
    stop_words = ['de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'con', 'a', 'mis', 'mi', 'tu', 'su']
    words = text.split('-')
    words = [word for word in words if word not in stop_words and len(word) > 2]
    final_slug = '-'.join(words)
    return final_slug if final_slug else "video-sin-titulo"

def clean_description_for_schema(description):
    """
    Limpia la descripción de YouTube (ruido, CTAs, enlaces) para optimizarla para Schema.org.
    """
    if not description:
        return ""

    # 1. Eliminar URLs (http:// o https://) y enlaces comunes
    description = re.sub(r'http[s]?:\/\/\S+', '', description, flags=re.MULTILINE)

    # 2. Eliminar CTAs y frases de boilerplate comunes
    description = re.sub(r'(?i)Conecta conmigo en redes:.*|Suscríbete aquí:.*|Participa:.*|Disclaimer:.*|Aquí:.*|¿Qué aprenderás en este video\?.*|Características principales:.*|Comenta abajo.*|Sígueme en redes:.*|Visita mi sitio:.*|Dale like, suscríbete y activa la campanita.*|La información de este canal.*|Aquí verás:.*', '', description, flags=re.MULTILINE | re.DOTALL)
    
    # 3. Eliminar caracteres de lista/CTA (👉, 🔔, 🎯, ✅, 💡, 📌, •) y el texto siguiente
    description = re.sub(r'[\👉\🔔\🎯\✅\💡\📌\•].*', '', description)
    
    # 4. Eliminar líneas vacías o excesivos saltos de línea
    description = re.sub(r'\n\s*\n', '\n', description).strip()
    
    # 5. Limitar la longitud al resumen principal (ej. 300 caracteres)
    if len(description) > 300:
        description = description[:300].rsplit(' ', 1)[0] + '...'

    return description.strip()

# 🟢 NUEVA FUNCIÓN: Carga datos existentes para preservación manual
def load_existing_videos():
    """
    Carga los datos de videos.yml existentes en un diccionario 
    para su fácil acceso, usando player_loc como clave.
    """
    if not os.path.exists(OUTPUT_VIDEOS):
        return {}
    
    print(f"-> Cargando datos existentes de {OUTPUT_VIDEOS} para preservar 'duration'...")
    try:
        with open(OUTPUT_VIDEOS, 'r', encoding='utf-8') as f:
            existing_list = yaml.safe_load(f)
            if not existing_list:
                return {}
    except Exception as e:
        print(f"Advertencia: No se pudo cargar o parsear {OUTPUT_VIDEOS}. Se procederá como si estuviera vacío. Error: {e}")
        return {}
    
    # Convertir la lista a un diccionario para búsqueda rápida por player_loc
    # Usamos .get('player_loc') por seguridad
    existing_map = {video.get('player_loc'): video for video in existing_list if video.get('player_loc')}
    return existing_map


def parse_youtube_feed():
    """Descarga el XML del feed, lo parsea y extrae/fusiona la data de los videos."""
    print("1. Descargando feed XML de YouTube...")
    try:
        response = requests.get(YOUTUBE_FEED_URL)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"ERROR al descargar el feed: {e}")
        return None, None

    root = ET.fromstring(response.content)

    # 🟢 Lógica de Fusión
    existing_videos_map = load_existing_videos()
    
    videos_data = []
    youtube_feed_data = []

    print("2. Extrayendo y procesando datos de los videos...")
    for entry in root.findall('atom:entry', NS):
        try:
            # 1. Extracción de datos del feed
            video_id = entry.find('yt:videoId', NS).text
            title = entry.find('atom:title', NS).text
            published_element = entry.find('atom:published', NS)
            published_date = published_element.text if published_element is not None else ""
            
            media_group = entry.find('media:group', NS)
            description_element = media_group.find('media:description', NS)
            raw_description = description_element.text.strip() if description_element is not None and description_element.text else ""
            clean_description = clean_description_for_schema(raw_description)
            
            thumbnail_element = media_group.find('media:thumbnail', NS)
            thumbnail_loc = thumbnail_element.get('url') if thumbnail_element is not None else ""
            
            # URLs
            loc_url = MULTIMEDIA_URL 
            player_loc_url = f"https://www.youtube.com/watch?v={video_id}"
            content_loc_url = f"https://www.youtube.com/v/{video_id}"
            
            # --- Datos para _data/youtube_feed.yml (Feed simple) ---
            youtube_feed_data.append({
                "id": video_id,
                "title": title
            })

            # --- Lógica de FUSIÓN de _data/videos.yml ---
            duration_value = 0
            if player_loc_url in existing_videos_map:
                # Video ya existe: preservamos su duración
                existing_data = existing_videos_map[player_loc_url]
                duration_value = existing_data.get('duration', 0)
                print(f"-> Fusión: Preservando duration={duration_value} para '{title}'")
            else:
                # Video nuevo: se añade con duración 0
                print(f"-> Nuevo Video: Añadiendo '{title}' con duration=0")
                
            
            # --- Construcción final del objeto de video ---
            videos_data.append({
                "titulo": title,
                "loc": loc_url, 
                "thumbnail_loc": thumbnail_loc,
                # Usamos la descripción limpia
                "description": clean_description,
                "content_loc": content_loc_url,
                "player_loc": player_loc_url,
                "published_date": published_date,
                # Usamos el valor fusionado (preservado o 0)
                "duration": duration_value 
            })

        except Exception as e:
            print(f"Advertencia: No se pudo procesar una entrada de video. Error: {e}")
            continue

    return youtube_feed_data, videos_data


def save_yaml_files(youtube_feed_data, videos_data):
    """Crea el directorio de salida si no existe y guarda los archivos YAML."""
    if not youtube_feed_data or not videos_data:
        print("No hay datos para guardar. Terminando el proceso.")
        return

    print(f"3. Creando directorio de salida: {OUTPUT_DIR}")
    os.makedirs(OUTPUT_DIR, exist_ok=True) 

    # Guardar youtube_feed.yml 
    print(f"4. Guardando {OUTPUT_YOUTUBE_FEED}")
    with open(OUTPUT_YOUTUBE_FEED, 'w', encoding='utf-8') as f:
        # Usamos sort_keys=False para mantener el orden de las claves
        yaml.dump(youtube_feed_data, f, allow_unicode=True, sort_keys=False, default_flow_style=False)
        
    # Guardar videos.yml 
    print(f"5. Guardando {OUTPUT_VIDEOS}")
    with open(OUTPUT_VIDEOS, 'w', encoding='utf-8') as f:
        # El formato de lista detallada usa el guion '-' al inicio de cada entrada
        yaml.dump(videos_data, f, allow_unicode=True, sort_keys=False, default_flow_style=False)

    print("\n✅ ¡Proceso completado con éxito!")
    print(f"Se generaron los archivos en la carpeta: {OUTPUT_DIR}")
    print("🚀 NOTA: El script preservó la 'duration' de videos existentes. Solo debes editar 'duration: 0' en los videos nuevos.")


if __name__ == "__main__":
    feed_data, videos_detailed = parse_youtube_feed()
    if feed_data and videos_detailed:
        save_yaml_files(feed_data, videos_detailed)