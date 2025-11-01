import React from 'react';
import type { User, Community, Channel } from '../../types';

export const UserResultCard: React.FC<{user: User}> = ({ user }) => (
    <a href={`#/profile/${user.id}`} className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-[#303030] transition-colors">
        <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
        <div>
            <div className="font-bold flex items-center gap-1.5 text-primary dark:text-gray-100">
                <span>{user.name}</span>
                {user.badgeUrl && <img src={user.badgeUrl} alt="badge" className="w-4 h-4" />}
            </div>
            <p className="text-sm text-secondary dark:text-gray-400">@{user.handle}</p>
        </div>
    </a>
);

export const CommunityResultCard: React.FC<{community: Community}> = ({ community }) => (
    <a href={`#/community/${community.id}`} className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-[#303030] transition-colors">
        <img src={community.avatarUrl} alt={community.name} className="w-14 h-14 rounded-lg object-cover" />
        <div>
            <p className="font-bold text-primary dark:text-gray-100">{community.name}</p>
            <p className="text-sm text-secondary dark:text-gray-400">{Object.keys(community.members).length} members</p>
        </div>
    </a>
);

export const ChannelResultCard: React.FC<{channel: Channel}> = ({ channel }) => (
    <a href={`#/channel/${channel.id}`} className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-[#303030] transition-colors">
        <img src={channel.avatarUrl} alt={channel.name} className="w-14 h-14 rounded-full object-cover" />
        <div>
            <p className="font-bold text-primary dark:text-gray-100">{channel.name}</p>
            <p className="text-sm text-secondary dark:text-gray-400">{Object.keys(channel.subscribers).length} subscribers</p>
        </div>
    </a>
);