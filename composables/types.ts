export type UserState = {
	id: number;
	name: string;
	email: string;
	profile_pic?: string;
} | null;
export type Admin = {
	id: number;
	name: string;
	email: string;
	profile_pic?: string;
	created_at: string;
};
export type User = {
	id: number;
	username: string;
	email: string;
	profile_pic?: string;
	created_at: string;
};
export type Vendor = {
	id: number;
	username: string;
	email: string;
	profile_pic?: string;
	created_at: string;
};
export type FetchStatus = "idle" | "pending" | "success" | "error";
export type Tag = {
	id: number;
	name: string;
};
export type Category = {
	id: number;
	name_en: string;
	name_km: string;
};
export type Location = {
	id: number;
	name_en: string;
	name_km: string;
	description_en: string;
	description_km: string;
	contact: string;
	address: string;
	map_link: string;
	website: string;
	vendor: Vendor;
	category: Category;
	tags: Tag[];
	media: {
		images: string[];
	};
	location_ratings: Rating[];
};
export type Rating = {
	id: number;
	rating: number;
	context: string;
	created_at: string;
	user: User;
	location: Location;
	location_id?: number;
	user_id?: number;
};
