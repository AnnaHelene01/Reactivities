import {Photo, Profile} from "../models/profile";
import {makeAutoObservable, runInAction} from "mobx";
import agent from "../api/agent";
import {toast} from "react-toastify";
import { store } from "./store";

export default class ProfileStore {
    profile: Profile | null = null;
    loadingProfile = false;
    uploading = false;
    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    get isCurrentUser() {
        if (store.userStore.user && this.profile) {
            return store.userStore.user.userName === this.profile.username;
        }
        return false;
    }

    loadProfile = async (userName: string) => {
        this.loadingProfile = true;
        try {
            console.log("Fetching profile for user:", userName);
            const profile = await agent.Profiles.get(userName); // Sjekk at denne forespørselen fungerer som forventet
            console.log("Profile data:", profile);
            
            // Sjekk at photos-feltet er definert og inneholder bildedata
            if (profile.photos) {
                console.log("Photos data:", profile.photos);
            } else {
                console.log("Photos data is null or undefined");
            }
    
            runInAction(() => {
                this.profile = profile;
                this.loadingProfile = false;
            });
        } catch (error) {
            toast.error('Problem loading profile');
            runInAction(() => {
                this.loadingProfile = false;
            });
        }
    };
    
    
    uploadPhoto = async (file: any) => {
        this.uploading = true;
        try {
            const response = await agent.Profiles.uploadPhoto(file);
            const photo = response.data;
            runInAction(() => {
                if (this.profile) {
                    this.profile.photos?.push(photo);
                    if (photo.isMain && store.userStore.user) {
                        store.userStore.setImage(photo.url);
                        this.profile.image = photo.url;
                    }
                }
                this.uploading = false;
            })
        } catch (error) {
            console.log(error);
            runInAction(() => this.uploading = false);
        }
    }

    setMainPhoto = async (photo: Photo) => {
        this.loading = true;
        try {
            await agent.Profiles.setMainPhoto(photo.id);
            store.userStore.setImage(photo.url);
            runInAction(() => {
                if (this.profile && this.profile.photos) {
                    this.profile.photos.find(a => a.isMain)!.isMain = false;
                    this.profile.photos.find(a => a.id === photo.id)!.isMain = true;
                    this.profile.image = photo.url;
                    this.loading = false;
                }
            })
        } catch (error) {
            console.log(error);
            runInAction(() => this.loading = false);
        }
    }

    deletePhoto = async (photo: Photo) => {
        this.loading = true;
        try {
            await agent.Profiles.deletePhoto(photo.id);
            runInAction(() => {
                if (this.profile) {
                    this.profile.photos = this.profile.photos?.filter(a => a.id !== photo.id);
                    this.loading = false;
                }
            })
        } catch (error) {
            toast.error('Problem deleting photo');
            this.loading = false;
        }
    }
}