
import Singleton from "../manager/Singleton";
import Utils from "./Utils";

export default class AudioMgr extends Singleton {

    public bgmVolume: number = 1;
    public sfxVolume: number = 1;

    public static DEFAULT_VOLUME = 0.3

    bgmAudioID: number = -1;
    audioId: number = -1;
    musicIndex=Utils.getRandomInt(0,4);
    loadSounds() {
        this.bgmVolume = AudioMgr.DEFAULT_VOLUME;
        this.sfxVolume = AudioMgr.DEFAULT_VOLUME;
        console.log("loadSounds", this.bgmVolume, this.sfxVolume)

        cc.log(this.bgmVolume, this.sfxVolume)
        // cc.assetManager.loadBundle("sounds",(err,ret)=>{
        //     console.log(err);
        //     this.playBgSeq()
        //  })
    }
    playBgSeq()
    {
        var index=(this.musicIndex%4)+1
        this.playBGM('music'+index)
        this.musicIndex++
    }

    private bgm_url: string = "music1"
    async playBGM(url: string) {
       
        this.bgm_url = url; 
         var audioUrl:cc.AudioClip =  (await Utils.loadRes(""+url,cc.AudioClip)) as cc.AudioClip;// this.getUrl(url);
    
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.stop(this.bgmAudioID);
        }
        if (this.bgmVolume > 0) {
            this.bgmAudioID = cc.audioEngine.play(audioUrl, true, this.bgmVolume);
        }
    }

    stopSFX(audioId: any) {
        var ok = cc.audioEngine.stop(audioId);
        return ok;
    }

    private lastplaysfxtime = {};
    async playSFX(url: string) {
         
        if(this.lastplaysfxtime[url])
        {
            if(Utils.getServerTime() - this.lastplaysfxtime[url] < 300)
            {
                // console.log(url,"跳过")
                return;
            }
        }

        this.lastplaysfxtime[url] = Utils.getServerTime();
        var audioUrl:cc.AudioClip =  (await Utils.loadRes(url,cc.AudioClip)) as cc.AudioClip;// this.getUrl(url);
     
        if (this.sfxVolume > 0) {
            this.audioId = cc.audioEngine.play(audioUrl, false, this.sfxVolume);
            return this.audioId;
        }
    }

    pauseBGM() {
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.pause(this.bgmAudioID);
            // cc.log("暂停bgm")
        }
    }

    resumBGM() {
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.resume(this.bgmAudioID);
            // cc.log("恢复bgm")
        }
    }

    setBGMVolume(v: number, force: boolean = false) {
        if (this.bgmVolume != v || force) {
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID, v);
        }
        if (this.bgmAudioID >= 0) {
            if (v > 0) {
                cc.audioEngine.resume(this.bgmAudioID);
            } else {
                cc.audioEngine.pause(this.bgmAudioID);
            }
        } else {
            this.playBGM(this.bgm_url);
        }
    }

    setSFXVolume(v: number, force: boolean = false) {
        if (this.sfxVolume != v || force) {
            this.sfxVolume = v;
            //设置音效大小会同时设置背景音乐的声音，不设置音效大小，本地音效依然可以受控使用，暂未找到原因
            // cc.audioEngine.setEffectsVolume(v);
        }
    }
}