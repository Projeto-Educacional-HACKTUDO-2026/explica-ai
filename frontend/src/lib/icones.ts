import type { TipoConteudo } from "./types"

export const ICONE_TIPO: Record<TipoConteudo, { emoji: string; rotulo: string }> = {
  texto: { emoji: "📝", rotulo: "Texto" },
  meme: { emoji: "😂", rotulo: "Meme" },
  audio: { emoji: "🎧", rotulo: "Áudio" },
  imagem: { emoji: "🖼️", rotulo: "Imagem" },
  video: { emoji: "🎬", rotulo: "Vídeo" },
}
