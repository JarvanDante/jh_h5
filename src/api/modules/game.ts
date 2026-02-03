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

// 游戏项
export interface GameItem {
  id: number
  site_id: number
  platform: string
  vendor: string
  code: string
  name: string
  style: string
  img: string
  img1: string
  hot: number
  recommend: number
  is_new: number
  status: number
  sort: number
  game_id: number
}

// 游戏列表响应
export interface GameListResponse {
  list: GameItem[]
  total: number
}

// 游戏列表请求参数
export interface GameListParams {
  platform?: string
  hot?: number
  is_new?: number
  recommend?: number
  page?: number
  size?: number
}

// 进入游戏请求参数
export interface RedirectToGameParams {
  game_id: number
  key: string
  mobile: number
}

// 进入游戏响应
export interface RedirectToGameResponse {
  type: string
  url: string
}

// 投注记录项
export interface BetHistoryItem {
  game_name: string
  valid_amount: number
  bet_time: string
  win_amount: number
  status: number
  order_no: string
  net_amount: number
}

// 投注记录响应
export interface BetHistoryResponse {
  list: BetHistoryItem[]
  total: number
}

// 投注记录请求参数
export interface BetHistoryParams {
  start_time?: string
  end_time?: string
  page?: number
  size?: number
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

  // 获取游戏列表
  getGameList(params?: GameListParams): Promise<GameListResponse> {
    const queryParams = new URLSearchParams()
    if (params?.platform) queryParams.append('platform', params.platform)
    if (params?.hot) queryParams.append('hot', params.hot.toString())
    if (params?.is_new) queryParams.append('is_new', params.is_new.toString())
    if (params?.recommend) queryParams.append('recommend', params.recommend.toString())
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.size) queryParams.append('size', params.size.toString())

    const url = `/frontend/game/frontend-game-list${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    return request.get(url)
  },

  // 进入游戏
  redirectToGame(params: RedirectToGameParams): Promise<RedirectToGameResponse> {
    return request.post('/frontend/game/redirect-to-game', params)
  },

  // 获取投注历史
  getBetHistory(params: BetHistoryParams): Promise<BetHistoryResponse> {
    return request.get('/frontend/game/bet-history', { params })
  },
}
