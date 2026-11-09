# UCSD classroom schedules

Live: 
//songsofia839-oss.github.io/ucsd-classrooms-modified/

<img width="1468" height="833" alt="Screenshot 2026-11-08 at 4 27 16 PM" src="https://github.com/user-attachments/assets/2026e326-871b-4b44-8dd8-b7af25eb8ea8" />

> [!NOTE]
> The classrooms website was originally developed in [SheepTester/uxdy/classrooms](https://github.com/SheepTester/uxdy/tree/main/classrooms); refer to the old repo for its commit history.
>
> The 3D features extend from [wenhaoquestion/ucsd-classrooms](https://github.com/wenhaoquestion/ucsd-classrooms).

## Features

- **Checking when a classroom is available.** Does RWAC 0935 have classes in it? When are they?
  - Feature: schedule for each room.
- **Finding ongoing lectures nearby to crash.** I'm sitting in the Jeannie studying as the next lecture comes in. What course is it for?
  - Feature: map of buildings.
- **Finding available classrooms during a specific time.** Spencer is available to teach juggling at 3 pm. What classroom can he teach it in?
  - Feature: changing the "current" time.
- **Getting the start and end dates of each quarter.** The internship application asks when I'm available to start. When does spring end? I'm too lazy to find that enrollment calendar website.
  - Feature: calendar view with quarters marked out.
- **Converting between month/day dates and quarter weeks.** May 15, what week is that?
  - Feature: calendar view with week numbers.
- **Looking up the lecture location for a class.** I'll crash ECE 100. Where is it? I'm too lazy to sign into WebReg, and searching up courses on there is slow.
  - Feature: search courses by course code, list meeting times/locations for a course.
- **Finding buildings by their code on the map.** Where is RECGM?
  - Feature: search buildings by code.
- **Finding what classes are taught by a professor this quarter.** What classes is Sworder teaching next quarter?
  - Feature: search sections by professor.
- **Determining when a professor is free.** I want to schedule a meeting with my professor. When might they be free?
  - Feature: calendar view for a professor.
- **Guiding students to buildings.** Where is Mosaic? It's next to Wolftown.
  - Feature: link to buildings directly, include photos of buildings.

Features added: 

- Modified UI for time-picker to be Google Calendar-like
- Modified outer UI for the time-picker
- Fixed a bug in the original search system (opposite availability display)
- Integrated 3D classroom visualization that extends [wenhaoquestion/ucsd-classrooms](https://github.com/wenhaoquestion/ucsd-classrooms)
- Integrated Zoom-in/Zoom-out feature

## Development

```shell
# Builds to dist/
$ npm run build

# Serves to http://localhost:8000/
# Note: Imgur is blocked on 127.0.0.1. https://stackoverflow.com/a/43910367
$ npm run dev
```

Map image was made with [this tool](https://sheeptester.github.io/words-go-here/misc/ucsd-map.html) (zoom 17, x: -6 to 5, y: -6 to 5).
Then, compress to a WebP with [Squoosh](https://squoosh.app/), quality 60.

### Stability convention

For React `memo` and hook dependencies, it is often important that objects and functions have a stable identity. Because `useEffect` is often used to perform side effects in response to value changes (akin to System Verilog `always_ff`), stability is important not just for performance but also unintended bugs, like [infinite loops](https://blog.cloudflare.com/deep-dive-into-cloudflares-sept-12-dashboard-and-api-outage/). However, there doesn't seem to be well established conventions or tooling to indicate when stability is important.

In this repo, I am experimenting with a new convention:

- All values that have a stable identity should be suffixed with `_s`. This includes the return value from `useStableCallback`, and setters and refs when react-hooks/exhaustive-deps can't figure out they're setters and refs.
  - I believe placating react-hooks/exhaustive-deps is important to maximize compatibility with the React Compiler in the future.
- All props that should have a stable identity should be suffixed with `_s`.

These only apply to non-primitive types, like functions and objects, because primitives always have a stable identity.

Known issues:

- I originally was going to use `$` as the suffix, but in VS Code, `$` is not considered a word character and doesn't get selected by ctrl+D. I purposefully included an underscore so it's clear it comes from a naming convention and isn't really part of the variable name (e.g. `myDeltaS` vs `myDelta_s`).

This project extends [SheepTester/ucsd-classrooms](https://github.com/SheepTester/ucsd-classrooms). 
The 3D features extend [wenhaoquestion/ucsd-classrooms](https://github.com/wenhaoquestion/ucsd-classrooms).
