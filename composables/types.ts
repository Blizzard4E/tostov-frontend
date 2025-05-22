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
	vender_id: number;
	category_id: number;
	category: Category;
	tags: Tag[];
	media: string[];
};
