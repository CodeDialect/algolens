import { indexerClient } from "../utils/constants";

export const Test = () => {
  const fun = async () => {
    const notePrefix = new TextEncoder().encode("sunnyceekay");
    const transactionInfo = await indexerClient
      .searchForTransactions()
      .notePrefix(notePrefix)
      .address("AAALPIHQEMQTFZGOWNXSVL77J6KJA7MZUYI7GJQZZSQFYDSU4FGHYQUKOA")
      .txType("appl")
      .do();
    return transactionInfo;
  };

  fun().then((transactionInfo) => {
    console.log(transactionInfo);
  });

  return (
    <div>
      <h1>Test Page</h1>
    </div>
  );
};
