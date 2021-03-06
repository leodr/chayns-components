# OpeningTimes

The OpeningTimes component is part of the _chayns-components_ package. It can be
installed via npm:

    npm install -S chayns-components@latest

## Usage

The OpeningTimes component has to be imported:

```jsx harmony
import { OpeningTimes } from 'chayns-components';
```

You can use the OpeningTimes like this:

```jsx harmony
<OpeningTimes
    times={[
        {
            weekDay: 0,
            disabled: true,
            start: '13:00',
            end: '18:30',
        },
        {
            weekDay: 3,
            start: '13:00',
            end: '15:00',
        },
    ]}
    onChange={(times, isValid) => console.log(times, isValid)}
/>
```

## Props

The following properties can be set on the OpeningTimes-Component

| **Property**  | **Description**                                    | **Type**                   | **Default Value** | **Required** |
| ------------- | -------------------------------------------------- | -------------------------- | ----------------- | ------------ |
| times         | Contains the timespans that will be shown          | array                      |                   | true         |
| time.weekDay  | Specifies the day of the week                      | number (Monday: 0)         |                   | true         |
| time.disabled | If true, the day will still be shown, but disabled | bool                       | false             |              |
| time.start    | The start of the timespan                          | string (HH:MM)             |                   | true         |
| time.end      | The end of the timespan                            | string (HH:MM)             |                   | true         |
| onChange      | Returns the modified times                         | func                       |                   |              |
| forceMobile   | Force mobile view                                  | bool                       | false             |              |
| hintPosition  | The position of the hint (top, bottom, none)       | OpeningTimes.hintPositions | TOP               |              |
| hintText      | Text that should be displayed inside the hint      | string                     |                   |              |
