import algosdk from "algosdk";

const config = {
    algodToken: "",
    algodServer: "https://testnet-api.algonode.network",
    algodPort: "",
    indexerToken: "",
    indexerServer: "https://testnet-idx.algonode.network",
    indexerPort: "",
}

export const algodClient = new algosdk.Algodv2(config.algodToken, config.algodServer, config.algodPort)

export const indexerClient = new algosdk.Indexer(config.indexerToken, config.indexerServer, config.indexerPort);

export const minRound = 41314351;

// https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0002.md
export const userNote = new TextEncoder().encode("user-algolens")
export const postNote = new TextEncoder().encode("post-algolens")
// Maximum local storage allocation, immutable
export const numLocalInts = 0;
export const numLocalBytes = 0;
// Maximum global storage allocation, immutable
export const numGlobalInts = 2;
export const numGlobalBytes = 3; 
