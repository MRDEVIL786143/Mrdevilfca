declare namespace rdxFca {
  interface LoginData {
    appState?: any[];
    Cookie?: string;
    email?: string;
    password?: string;
  }

  interface APIOptions {
    selfListen?: boolean;
    selfListenEvent?: boolean;
    listenEvents?: boolean;
    listenTyping?: boolean;
    updatePresence?: boolean;
    forceLogin?: boolean;
    autoMarkRead?: boolean;
    autoReconnect?: boolean;
    online?: boolean;
    emitReady?: boolean;
    userAgent?: string;
  }

  interface ThreadInfo {
    threadID: string;
    name: string;
    participants: string[];
    messageCount: number;
    lastMessage: string;
    lastActivity: number;
    isGroup: boolean;
  }

  interface Message {
    type: string;
    senderID: string;
    threadID: string;
    messageID: string;
    body: string;
    timestamp: number;
    isGroup: boolean;
  }

  interface UserInfo {
    userID: string;
    name: string;
    firstName: string;
    lastName: string;
    avatar: string;
  }

  interface API {
    rdx: boolean;
    version: string;
    owner: string;
    getCurrentUserID(): string;
    getAppState(): any[];
    setOptions(options: APIOptions): void;
    getOptions(): APIOptions;
    sendMessage(threadID: string, message: string): Promise<any>;
    sendTypingIndicator(threadID: string): Promise<any>;
    setMessageReaction(messageID: string, reaction: string): Promise<any>;
    markAsRead(threadID: string, messageID: string): Promise<any>;
    markAsDelivered(threadID: string, messageID: string): Promise<any>;
    getThreadList(limit?: number): Promise<any[]>;
    getThreadInfo(threadID: string): Promise<ThreadInfo>;
    getThreadHistory(threadID: string, limit?: number): Promise<any>;
    getThreadPictures(threadID: string): Promise<any[]>;
    getFriendsList(): Promise<any[]>;
    createNewGroup(name: string, participants: string[]): Promise<any>;
    addUserToGroup(userID: string, threadID: string): Promise<any>;
    removeUserFromGroup(userID: string, threadID: string): Promise<any>;
    changeThreadColor(color: string, threadID: string): Promise<any>;
    changeThreadEmoji(emoji: string, threadID: string): Promise<any>;
    setTitle(title: string, threadID: string): Promise<any>;
    muteThread(threadID: string, muteTime: number): Promise<any>;
    pinMessage(threadID: string, pin: boolean): Promise<any>;
    deleteThread(threadID: string): Promise<any>;
    deleteMessage(messageID: string): Promise<any>;
    editMessage(messageID: string, newText: string): Promise<any>;
    forwardMessage(messageID: string, threadID: string): Promise<any>;
    handleFriendRequest(userID: string, accept: boolean): Promise<any>;
    handleMessageRequest(threadID: string, accept: boolean): Promise<any>;
    changeAvatar(imagePath: string): Promise<any>;
    changeBio(bio: string): Promise<any>;
    changeName(firstName: string, lastName: string): Promise<any>;
    changeAdminStatus(userID: string, threadID: string, admin: boolean): Promise<any>;
    changeBlockedStatus(userID: string, block: boolean): Promise<any>;
    unfriend(userID: string): Promise<any>;
    logout(): Promise<any>;
    listenMqtt(callback: (err: any, message: Message) => void): any;
  }

  function login(data: LoginData, options?: APIOptions): Promise<API>;
  function login(data: LoginData, callback: (err: any, api: API) => void): void;
  function login(data: LoginData, options: APIOptions, callback: (err: any, api: API) => void): void;

  export default login;
}

export = devilFca;
