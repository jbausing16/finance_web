export const Loading = () => {
  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <div className="flex justify-center items-center w-full h-full">
        <img
          src="/blue_loading.png"
          alt="Loading"
          className="h-auto w-32 animate-spin"
        />
      </div>
    </div>
  );
};
