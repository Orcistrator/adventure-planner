'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc } from '@/convex/_generated/dataModel';
import { Search, ImageIcon } from 'lucide-react';

interface AdventureHeaderProps {
  adventure: Doc<'adventures'>;
  isEditing: boolean;
}

export default function AdventureHeader({ adventure, isEditing }: AdventureHeaderProps) {
  const updateAdventure = useMutation(api.adventures.update);

  const [title, setTitle] = useState(adventure.title);
  const [subtitle, setSubtitle] = useState(adventure.subtitle ?? '');
  const [level, setLevel] = useState(adventure.level ?? '');
  const [type, setType] = useState(adventure.type ?? '');
  const [environment, setEnvironment] = useState(adventure.environment ?? '');
  const [tagsRaw, setTagsRaw] = useState(adventure.tags.join(', '));
  const [coverImage, setCoverImage] = useState(adventure.coverImage ?? '');

  useEffect(() => {
    setTitle(adventure.title);
    setSubtitle(adventure.subtitle ?? '');
    setLevel(adventure.level ?? '');
    setType(adventure.type ?? '');
    setEnvironment(adventure.environment ?? '');
    setTagsRaw(adventure.tags.join(', '));
    setCoverImage(adventure.coverImage ?? '');
  }, [adventure]);

  const save = (patch: Record<string, unknown>) => {
    updateAdventure({ id: adventure._id, ...patch } as Parameters<typeof updateAdventure>[0]);
  };

  const tags = adventure.tags;

  return (
    <header className="relative h-[60vh] min-h-[400px] flex items-end pb-12 pt-32">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {coverImage ? (
          <img
            src={coverImage}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </div>

      {/* Cover image edit */}
      {isEditing && (
        <div className="absolute top-4 right-4 z-20">
          <div className="flex items-center gap-2 bg-black/60 rounded-lg px-3 py-2 backdrop-blur-sm">
            <ImageIcon size={14} className="text-white/70" />
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              onBlur={() => save({ coverImage: coverImage || undefined })}
              placeholder="Cover image URL"
              className="bg-transparent text-white text-sm outline-none placeholder:text-white/40 w-64"
            />
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
        {/* Meta row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {isEditing ? (
            <>
              <input
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                onBlur={() => save({ level: level || undefined })}
                placeholder="Level"
                className="bg-transparent text-white font-semibold tracking-wider text-sm outline-none border-b border-white/30 focus:border-white pb-0.5 w-20 placeholder:text-white/40"
              />
              <input
                value={tagsRaw}
                onChange={(e) => setTagsRaw(e.target.value)}
                onBlur={() =>
                  save({ tags: tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) })
                }
                placeholder="Tags (comma separated)"
                className="bg-transparent text-white/70 text-xs outline-none border-b border-white/30 focus:border-white pb-0.5 placeholder:text-white/40 min-w-[180px]"
              />
            </>
          ) : (
            <>
              {level && (
                <span className="text-white font-semibold tracking-wider text-sm">
                  LEVEL {level.toUpperCase()}
                </span>
              )}
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 border border-amber-500 text-amber-400 text-xs font-bold tracking-widest uppercase rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </>
          )}
        </div>

        {/* Title */}
        {isEditing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => save({ title })}
            className="font-heading text-5xl md:text-7xl text-white font-bold leading-tight mb-4 drop-shadow-lg bg-transparent outline-none border-b-2 border-white/30 focus:border-white w-full pb-1 placeholder:text-white/40"
            placeholder="Adventure title"
          />
        ) : (
          <h1 className="font-heading text-5xl md:text-7xl text-white font-bold leading-tight mb-4 drop-shadow-lg">
            {adventure.title}
          </h1>
        )}

        {/* Subtitle / type row */}
        <div className="flex items-center gap-2 text-gray-300 text-lg">
          {isEditing ? (
            <>
              <Search size={20} />
              <input
                value={type}
                onChange={(e) => setType(e.target.value)}
                onBlur={() => save({ type: type || undefined })}
                placeholder="Type (e.g. Mystery)"
                className="bg-transparent outline-none text-gray-300 border-b border-white/20 focus:border-white pb-0.5 placeholder:text-white/30"
              />
              <span className="text-white/30 mx-2">·</span>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                onBlur={() => save({ subtitle: subtitle || undefined })}
                placeholder="Subtitle"
                className="bg-transparent outline-none text-gray-300 border-b border-white/20 focus:border-white pb-0.5 placeholder:text-white/30 flex-1"
              />
            </>
          ) : (
            <>
              {adventure.type && (
                <>
                  <Search size={20} />
                  <span>{adventure.type}</span>
                </>
              )}
              {adventure.type && adventure.subtitle && (
                <span className="text-white/30 mx-1">·</span>
              )}
              {adventure.subtitle && <span>{adventure.subtitle}</span>}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
