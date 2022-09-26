import mongoose from 'mongoose';

type Blogger = {
  id: string;
  name: string;
  youtubeUrl: string;
};

export const bloggerStub = (
  id: string,
  name: string,
  youtubeUrl: string,
): Blogger => {
  return {
    id,
    name,
    youtubeUrl,
  };
};
