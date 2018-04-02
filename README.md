# DragonTide
[![Build Status](https://travis-ci.org/BlackChaosNL/dragontide.svg?branch=master)](https://travis-ci.org/BlackChaosNL/dragontide)
[![Coverage Status](https://coveralls.io/repos/github/BlackChaosNL/dragontide/badge.svg?branch=master)](https://coveralls.io/github/BlackChaosNL/dragontide?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/BlackChaosNL/dragontide/badge.svg)](https://snyk.io/test/github/BlackChaosNL/dragontide)

## D&D Website API.

Actual version : `0.0.0`

This is a ReSTFUL service to build a D&D website with. Front-end will be developed at some point as well. If you want to contribute, feel free to leave a pull-request with a description.

## Usage
We included the following items for you to use with your own front-end:

**Note: Marked is completely implemented.**

## ToDo for general part

- [ ] Updater.
- [ ] >98% code coverage.

#### General usage
- [X] Authentication.
- [X] Authorization.

#### Character
- [X] General template for a D&D Character.
- [ ] Auto filling stats.
- [ ] Tying a character to a campaign.
- [ ] Generic items assignable to character.
- [ ] Admin should be able to change character items, stats, etc.

#### Campaign
- [X] List of open (public?) games.
- [X] Players can make their own campaign.
- [X] Players can update their own campaign.
- [X] Players can remove their made game.
- [X] Assign a DM. (Done automatically while creating a room).
- [ ] Revote DM when DM is inactive for `x` amount of time.
- [ ] Invite players with code.
- [ ] Campaign should be joinable with room-code.
- [ ] Avatar.
- [ ] Map(s)

#### Map
- [ ] Tile size
- [ ] Map background.
- [ ] Tile circumference.

#### Items
- [ ] Generic item. (Assignable within Campaign)
- [X] Item stat assignable.
- [ ] Descriptions.
- [ ] Unique items per campaign.

#### Chat
- [ ] IRC implementation (?)
- [ ] Chat within a campaign.
- [ ] Ability to roll dice, and get a response.
