import { request } from '@/utils/request'

// 游戏分类项
export interface GameCategory {
  game_id: number
  name: string
  platform: string
  type: number
  image_code: string
  db_name: string
  sort: number
  status: number
}

// 游戏分类响应
export interface GameCategoriesResponse {
  categories: GameCategory[]
}

// 游戏 API
export const gameApi = {
  // 获取游戏分类
  getGameCategories(type?: number): Promise<GameCategoriesResponse> {
    const url = type
      ? `/frontend/game/game-categories?type=${type}`
      : '/frontend/game/game-categories'
    return request.get(url)
  },
}
