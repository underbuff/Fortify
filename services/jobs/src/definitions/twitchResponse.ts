export interface TwitchStreamsResponse {
	data: Stream[]
	pagination: {}
}

export interface Stream {
	id: string
	user_id: string
	user_login: string
	user_name: string
	game_id: string
	game_name: string
	type: 'live'
	started_at: string
	viewer_count: number
}
