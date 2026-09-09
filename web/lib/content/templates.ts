/**
 * Public checklist templates rendered at /checklists/[slug].
 *
 * English-only by design. Items are inserted into a new project with source
 * language "en" and translated per viewer, so keep the wording literal and
 * plain: no idioms, no wordplay, short sentences, and units spelled out.
 */

import type { ChecklistTemplate } from "./types";

export const TEMPLATES: ChecklistTemplate[] = [
  // ---------------------------------------------------------------------------
  // 1. Kitchen renovation
  // ---------------------------------------------------------------------------
  {
    slug: "kitchen-renovation-checklist",
    name: "Kitchen Renovation",
    metaTitle: "Kitchen Renovation Checklist Template",
    metaDesc:
      "A kitchen renovation checklist covering permits, rough-in plumbing and electrical, cabinets, countertops, appliances and the final walkthrough.",
    keywords: [
      "kitchen renovation checklist",
      "kitchen remodel checklist",
      "kitchen renovation steps",
      "kitchen rough-in checklist",
      "cabinet installation checklist",
      "kitchen remodel timeline",
      "kitchen punch list",
      "kitchen renovation planning",
    ],
    kicker: "Checklist template",
    intro:
      "A kitchen renovation runs through the same ten phases almost every time, and most problems come from doing one of them out of order. This checklist follows the work from the first measurements to the final walkthrough, with the dimensions and code items that are easy to miss until the walls are closed. Use it as the shared list for you, your contractor and every trade on the job.",
    howToUse: [
      "Start a project from this template and delete the sections that do not apply to your job. A kitchen with no wall removal does not need the structural items, and a cabinet refacing job skips most of the rough-in work.",
      "Assign each section to the person who actually does the work: the plumber owns rough-in plumbing, the electrician owns rough-in electrical, the cabinet installer owns cabinets and countertops. Everyone sees the list in their own language, so the same item reads correctly for each trade.",
      "Check items off as they pass, not as they start. Add a photo to any item that will be hidden later, especially the open walls before drywall, because those pictures are the only record of where the pipes and wires run.",
    ],
    audience: [
      "Homeowners",
      "General contractors",
      "Kitchen designers",
      "Remodeling crews",
      "Project managers",
      "Cabinet installers",
      "Owners renovating remotely",
    ],
    sections: [
      {
        name: "Planning and design",
        items: [
          {
            title: "Measure the existing kitchen and record every dimension",
            description:
              "Record wall lengths, window and door positions, ceiling height, and the location of any structural column or chase.",
          },
          {
            title: "Confirm appliance sizes before the layout is final",
            description:
              "Cabinet openings are built to the appliance specification sheet, so choose the models before anything is ordered.",
          },
          {
            title: "Decide whether any wall will be removed",
            description:
              "Removing a load bearing wall needs a structural engineer and a beam, which changes the budget, the permit and the schedule.",
          },
          {
            title: "Plan at least 15 inches of counter landing space beside the range",
            description:
              "Most codes require a landing area next to a cooking surface so hot pans have somewhere to go.",
          },
          {
            title: "Set the distances between sink, range and refrigerator",
            description:
              "Keep each leg of the work triangle between 4 and 9 feet so two people can work without crossing paths.",
          },
          {
            title: "Choose the sink, faucet and range hood before rough-in",
            description:
              "Drain, supply and duct positions all depend on these models, so confirm them early even if delivery is later.",
          },
          {
            title: "Set the budget with a contingency of 10 to 15 percent",
            description:
              "Older kitchens hide failed plumbing, old wiring and water damage that only appear after demolition.",
          },
          {
            title: "Agree the written scope and allowances with the contractor",
            description:
              "List which materials the contractor supplies and which you supply, with a price allowance for every undecided item.",
          },
        ],
      },
      {
        name: "Permits and approvals",
        items: [
          {
            title: "Confirm which permits the work needs",
            description:
              "Most kitchen work needs plumbing and electrical permits, and moving walls or windows needs a building permit.",
          },
          { title: "Submit the drawings to the building department" },
          {
            title: "Get building or homeowners association approval",
            description:
              "Buildings often restrict work hours, elevator use, and any change to shared plumbing risers.",
          },
          { title: "Confirm the contractor license and insurance are current" },
          {
            title: "Schedule the inspection sequence with the building department",
            description:
              "Rough-in inspections have to pass before the walls are closed, so book them into the schedule now.",
          },
          { title: "Post the permit on site and keep the approved drawings there" },
        ],
      },
      {
        name: "Demolition",
        items: [
          {
            title: "Shut off water, gas and power to the work area",
            description:
              "Cap the lines and label every shutoff so nobody restores a service by accident.",
          },
          {
            title: "Test for asbestos and lead before disturbing old finishes",
            description:
              "Homes built before 1980 may have asbestos in floor tile and lead in paint, and both need trained removal.",
          },
          {
            title: "Protect floors, doorways and adjacent rooms",
            description:
              "Use dust barriers with zippers at doorways and cover any flooring that will remain.",
          },
          {
            title: "Set up a temporary kitchen",
            description:
              "Move the refrigerator, a microwave and a kettle to another room before the sink comes out.",
          },
          { title: "Remove cabinets, countertops and appliances" },
          { title: "Open walls only where the scope requires" },
          {
            title: "Inspect the exposed framing for rot, water damage and old wiring",
            description:
              "Price any repair found here as a change before the trades start their rough-in.",
          },
        ],
      },
      {
        name: "Rough-in plumbing",
        items: [
          { title: "Set the sink drain and supply locations from the cabinet drawings" },
          {
            title: "Confirm the drain slope",
            description:
              "Horizontal drain lines need a fall of about one quarter inch per foot toward the stack.",
          },
          {
            title: "Install the vent for the sink drain",
            description:
              "Every trap needs a vent, and an island sink usually needs a loop vent or an air admittance valve where local code allows one.",
          },
          {
            title: "Run the refrigerator water line with its own shutoff valve",
            description:
              "Place the valve where it can be reached without pulling the refrigerator out.",
          },
          { title: "Rough in the dishwasher supply, drain and air gap" },
          { title: "Add a shutoff valve for every fixture" },
          {
            title: "Pressure test the new lines before the walls close",
            description:
              "A leak found under pressure now costs nothing compared with one found behind finished tile.",
          },
          { title: "Book and pass the plumbing rough-in inspection" },
        ],
      },
      {
        name: "Rough-in electrical",
        items: [
          {
            title: "Plan the small appliance circuits",
            description:
              "Kitchen counter receptacles normally need at least two dedicated 20 amp circuits.",
          },
          {
            title: "Provide GFCI protection for receptacles within 6 feet of the sink",
            description:
              "Most codes now require GFCI protection on all kitchen counter receptacles, and always on those near water.",
          },
          {
            title: "Space counter receptacles so no point is more than 24 inches from one",
            description:
              "Measured along the counter, this usually means a receptacle every 4 feet.",
          },
          { title: "Run dedicated circuits for the range, oven, dishwasher, disposal and microwave" },
          { title: "Rough in the range hood circuit and its duct in the same trip" },
          {
            title: "Plan lighting in layers",
            description:
              "Include ceiling lights, under cabinet task lighting, and a separately switched circuit for island pendants.",
          },
          {
            title: "Set switch and receptacle heights against the finished backsplash",
            description:
              "Mark the finished counter and backsplash heights on the studs so no outlet lands on a tile edge.",
          },
          { title: "Label the panel, then book and pass the electrical rough-in inspection" },
        ],
      },
      {
        name: "Walls and ceiling",
        items: [
          { title: "Insulate exterior walls and air seal every penetration" },
          {
            title: "Photograph every open wall before drywall",
            description:
              "Take pictures showing pipe and wire locations and keep them with the project records.",
          },
          {
            title: "Add blocking for wall cabinets, shelves and the range hood",
            description:
              "Screwing into blocking rather than drywall anchors is what keeps loaded upper cabinets on the wall.",
          },
          { title: "Install a water resistant panel behind the sink wall" },
          { title: "Hang, tape and sand the drywall" },
          {
            title: "Check walls for plumb and corners for square before cabinet layout",
            description:
              "Out of square corners change the filler sizes, and it is cheaper to know before the cabinets arrive.",
          },
          { title: "Prime and paint the ceiling and walls before cabinets go in" },
        ],
      },
      {
        name: "Flooring",
        items: [
          {
            title: "Check the subfloor for level and stiffness",
            description:
              "Tile needs a flat and stiff subfloor, so correct dips and add support before setting anything.",
          },
          {
            title: "Decide whether the flooring runs under the cabinets",
            description:
              "Running the floor through simplifies future changes, and stopping at the cabinets saves material.",
          },
          { title: "Confirm the finished floor height at every doorway and transition" },
          { title: "Install the underlayment or membrane the flooring manufacturer specifies" },
          {
            title: "Set the flooring and allow the full cure time before loading it",
            description:
              "Cabinets and appliances rolled over uncured tile break the bond and crack grout later.",
          },
          { title: "Protect the finished floor during cabinet and appliance installation" },
          { title: "Install thresholds and base moulding" },
        ],
      },
      {
        name: "Cabinets and countertops",
        items: [
          {
            title: "Check the cabinet delivery against the order list",
            description:
              "Inspect every box for damage and correct size on the day it arrives, while a claim is still simple.",
          },
          { title: "Find the high point of the floor and set a level layout line" },
          { title: "Install the wall cabinets before the base cabinets" },
          { title: "Set the base cabinets level and shim them to the layout line" },
          {
            title: "Confirm the counter height and overhang",
            description:
              "A standard counter is about 36 inches high with a 1 inch overhang past the cabinet face.",
          },
          {
            title: "Template the countertop only after the base cabinets are fixed",
            description:
              "Stone fabricators measure the installed cabinets, not the drawings, so nothing can move afterwards.",
          },
          {
            title: "Confirm the sink and cooktop cutouts on the template",
            description:
              "Check the cutout positions and the faucet hole count against the actual fixtures before the stone is cut.",
          },
          { title: "Install the countertop, then seal the stone if the material needs it" },
          { title: "Fit the backsplash after the countertop is in place" },
        ],
      },
      {
        name: "Appliances and fixtures",
        items: [
          {
            title: "Confirm the range hood airflow",
            description:
              "Size the hood to the cooking surface, commonly about 100 CFM per linear foot for a wall hood and more for an island hood.",
          },
          {
            title: "Vent the hood to the outside with rigid duct",
            description:
              "Rigid metal duct with few bends keeps the rated airflow, and flexible duct reduces it.",
          },
          {
            title: "Provide make-up air where the hood exceeds 400 CFM",
            description:
              "A large hood can depressurize a tight house, and many codes require a make-up air supply above this level.",
          },
          { title: "Install the sink, faucet and disposal and check for leaks" },
          { title: "Connect the dishwasher with a high loop or an air gap" },
          { title: "Install the range, oven and refrigerator and check clearances to the cabinets" },
          {
            title: "Run every appliance through a full cycle",
            description:
              "Test the oven at temperature, the dishwasher on a full wash, and the ice maker after a day.",
          },
          { title: "Register the warranties and file the manuals with the project" },
        ],
      },
      {
        name: "Final walkthrough",
        items: [
          { title: "Walk the kitchen with the contractor and write one shared punch list" },
          {
            title: "Open and close every door and drawer",
            description:
              "Check alignment, soft close operation, and that nothing rubs the neighboring door.",
          },
          { title: "Test every outlet, switch and light, including the GFCI test buttons" },
          { title: "Check under the sink and around the dishwasher for leaks after a full cycle" },
          {
            title: "Check caulk, grout and paint touch ups in daylight",
            description:
              "Defects that hide under work lights are obvious in the morning, so look at the room twice.",
          },
          { title: "Confirm all inspections passed and collect the final sign off" },
          { title: "Collect lien releases, warranties and the final invoice" },
          {
            title: "Agree a completion date for every punch list item before the final payment",
            description:
              "The remaining payment is the only leverage left once the crew has moved to the next job.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "How long does a kitchen renovation take?",
        a: "A kitchen with no structural change usually runs 6 to 10 weeks on site, plus 4 to 12 weeks beforehand for design, permits and cabinet lead time. Countertop fabrication adds 1 to 3 weeks after the cabinets are installed, because the template can only be taken once they are fixed in place.",
      },
      {
        q: "What order should the work follow?",
        a: "Demolition, then structural changes, then rough-in plumbing and electrical, then inspections, then insulation and drywall, then paint, then flooring, then cabinets, then countertop template and installation, then backsplash, then appliances and fixtures. The rough-in inspections are the gate: nothing gets closed up until they pass.",
      },
      {
        q: "Which items are most often missed?",
        a: "Blocking for the upper cabinets and the range hood, the make-up air requirement for a large hood, the refrigerator water line shutoff in a reachable position, and photographs of the open walls before drywall. All four are cheap during rough-in and expensive afterwards.",
      },
      {
        q: "Can I use this checklist with a contractor who does not speak my language?",
        a: "Yes. Items are written once in English and each person sees them in their own language, so the same list works for you, the contractor and every trade. Comments and photos are translated the same way.",
      },
    ],
    related: [
      "bathroom-remodel-checklist",
      "whole-house-renovation-checklist",
      "contractor-punch-list",
    ],
    guides: [
      "things-homeowners-forget-during-a-kitchen-renovation",
      "italian-kitchen-and-bathroom-renovation-checklist",
      "contractor-punch-list-how-to-write-one",
    ],
    cta: "/for-homeowners",
    publishedAt: "2026-09-08",
  },

  // ---------------------------------------------------------------------------
  // 2. Bathroom remodel
  // ---------------------------------------------------------------------------
  {
    slug: "bathroom-remodel-checklist",
    name: "Bathroom Remodel",
    metaTitle: "Bathroom Remodel Checklist Template",
    metaDesc:
      "A bathroom remodel checklist covering permits, rough-in heights, waterproofing, ventilation, tile and the final walkthrough, with code clearances noted.",
    keywords: [
      "bathroom remodel checklist",
      "bathroom renovation checklist",
      "shower waterproofing checklist",
      "bathroom rough-in dimensions",
      "toilet clearance requirements",
      "bathroom exhaust fan sizing",
      "bathroom punch list",
      "shower niche placement",
    ],
    kicker: "Checklist template",
    intro:
      "A bathroom is the smallest room in a renovation and the one with the most ways to go wrong, because water, ventilation and clearances all have to be right before the tile goes on. This checklist covers the whole job with the clearances, rough-in heights and waterproofing steps written into the items. Work through it in order and the expensive mistakes get caught while they are still cheap.",
    howToUse: [
      "Start a project from this template, then delete what does not apply. A tub to shower conversion keeps almost every item, while a cosmetic refresh drops the rough-in and waterproofing sections.",
      "Give the waterproofing section to whoever is responsible for the shower, and require a photo on each item. The flood test and the finished membrane are the two things you cannot inspect once tile is set, so the photographs are the record.",
      "Confirm the actual fixtures before the plumber starts. Toilet rough-in distances and valve depths differ between models, and a fixture change after rough-in usually means opening a wall again.",
    ],
    audience: [
      "Homeowners",
      "General contractors",
      "Plumbers",
      "Tile setters",
      "Bathroom designers",
      "Property managers",
      "Owners renovating remotely",
    ],
    sections: [
      {
        name: "Planning and layout",
        items: [
          { title: "Measure the room and record every existing fixture location" },
          {
            title: "Confirm the toilet centerline is at least 15 inches from any wall",
            description:
              "Codes generally require 15 inches from the centerline of the toilet to a side wall, vanity or other fixture.",
          },
          {
            title: "Allow at least 21 inches of clear floor space in front of the toilet",
            description:
              "Measure from the front edge of the bowl to the wall, door or vanity opposite it.",
          },
          {
            title: "Set the shower size and check the door swing",
            description:
              "A shower is commonly at least 30 by 30 inches inside, and the door must not strike the toilet or the vanity.",
          },
          {
            title: "Choose the vanity, toilet, tub and shower valve before rough-in",
            description:
              "Rough-in dimensions differ between models, so the plumber needs the actual specification sheets.",
          },
          {
            title: "Decide on a curbed or curbless shower entry",
            description:
              "A curbless shower needs the floor framing recessed, which has to be planned before demolition finishes.",
          },
          { title: "Plan storage, towel bar and toilet paper holder positions before the walls close" },
          { title: "Agree the written scope, allowances and schedule with the contractor" },
        ],
      },
      {
        name: "Permits and approvals",
        items: [
          { title: "Confirm whether the work needs plumbing, electrical or building permits" },
          {
            title: "Check whether moving a toilet or a drain triggers extra review",
            description:
              "Relocating a drain often means opening the floor structure, which is reviewed differently from a fixture swap.",
          },
          { title: "Get building or association approval for any work on shared risers" },
          { title: "Confirm the contractor license and insurance are current" },
          { title: "Book the rough-in and final inspections into the schedule" },
        ],
      },
      {
        name: "Demolition",
        items: [
          { title: "Shut off and cap the water supply to the bathroom" },
          { title: "Test for asbestos and lead before removing old tile, flooring or paint" },
          { title: "Protect the route from the bathroom door to the exit" },
          { title: "Remove fixtures, tile and old waterproofing down to the framing" },
          {
            title: "Inspect the subfloor and framing for water damage and rot",
            description:
              "Leaks around tubs and toilets usually only show when the finishes come off, so allow time for repair.",
          },
          {
            title: "Confirm the joist direction before planning any new drain run",
            description:
              "Drains cannot cut across joists freely, and this often decides where a fixture can actually go.",
          },
          { title: "Remove all debris and keep the open floor dry" },
        ],
      },
      {
        name: "Rough-in plumbing",
        items: [
          {
            title: "Set the toilet flange position from the fixture rough-in dimension",
            description:
              "Most toilets rough in at 12 inches from the finished wall, but 10 inch and 14 inch models exist.",
          },
          {
            title: "Set the shower valve height",
            description:
              "A shower only valve is commonly roughed in 42 to 48 inches above the finished floor, and a tub and shower valve lower at 28 to 32 inches.",
          },
          {
            title: "Set the shower arm height",
            description:
              "A shower arm is commonly 78 inches above the finished floor, and higher where the users are tall.",
          },
          {
            title: "Pre-slope the shower pan toward the drain",
            description:
              "A fall of about one quarter inch per foot moves water to the drain underneath the waterproofing.",
          },
          { title: "Install the tub or shower base and support it as the manufacturer requires" },
          { title: "Vent every trap and confirm the vent sizes" },
          { title: "Rough in the vanity supply and drain to suit the chosen vanity" },
          {
            title: "Pressure test the supply lines and fill test the drains",
            description:
              "Do both before anything is closed, and record the result on this item.",
          },
          { title: "Book and pass the plumbing rough-in inspection" },
        ],
      },
      {
        name: "Rough-in electrical and ventilation",
        items: [
          { title: "Provide GFCI protection for every bathroom receptacle" },
          { title: "Run a dedicated 20 amp circuit for the bathroom receptacles" },
          {
            title: "Size the exhaust fan to the room",
            description:
              "A common rule is 1 CFM per square foot of floor area with a minimum of 50 CFM, and about 50 CFM per fixture in a larger bathroom.",
          },
          {
            title: "Duct the fan to the outside, never into the attic",
            description:
              "Use rigid or insulated duct on the shortest run possible, with an exterior damper so moist air leaves the building.",
          },
          {
            title: "Keep switches and receptacles out of the shower zone",
            description:
              "Check the local clearance rule for devices near a tub or shower opening before boxes are set.",
          },
          {
            title: "Plan lighting at the mirror as well as on the ceiling",
            description:
              "Lights on both sides of the mirror at about eye height remove the shadows a ceiling light creates.",
          },
          { title: "Rough in heated floor wiring and the thermostat sensor if one is used" },
          {
            title: "Add blocking for grab bars even if they are installed later",
            description:
              "Blocking costs almost nothing during framing and cannot be added once the wall is tiled.",
          },
          { title: "Book and pass the electrical rough-in inspection" },
        ],
      },
      {
        name: "Waterproofing",
        items: [
          { title: "Install cement board or a waterproof backer board in all wet areas" },
          {
            title: "Apply the waterproofing as one continuous system",
            description:
              "Follow a single manufacturer system for the pan, walls, corners and drain rather than mixing products.",
          },
          { title: "Seal every corner, seam and pipe penetration" },
          {
            title: "Set the shower niche between studs at a usable height",
            description:
              "Keep the niche off the shower head wall, commonly 48 to 60 inches above the floor.",
          },
          {
            title: "Waterproof the niche and any bench, including the top surface",
            description:
              "Slope the niche shelf and the bench slightly toward the shower so water drains off them.",
          },
          {
            title: "Flood test the shower pan for 24 hours before tiling",
            description:
              "Plug the drain, fill the pan, mark the water line, and check the level and the ceiling below the next day.",
          },
          { title: "Extend the waterproofing behind the tub surround to the required height" },
          { title: "Photograph the finished waterproofing on every wall before tiling" },
        ],
      },
      {
        name: "Tile and finishes",
        items: [
          {
            title: "Check the substrate is flat before tiling",
            description:
              "Large format tile needs a flatter surface than small tile, so correct high and low spots first.",
          },
          {
            title: "Set out the tile layout and dry lay the pattern",
            description:
              "Plan the cuts so full tiles land at eye level and no narrow sliver falls in a visible corner.",
          },
          { title: "Confirm the slope to the drain still holds after the tile is set" },
          {
            title: "Use the specified trowel and back butter large tiles",
            description:
              "Full coverage under the tile prevents hollow spots that crack later in a wet area.",
          },
          { title: "Grout, then seal the grout or stone where the manufacturer requires it" },
          {
            title: "Use flexible sealant at every change of plane",
            description:
              "Corners and the joint between wall and floor move, so they take sealant rather than grout.",
          },
          { title: "Paint with a finish suited to a wet room and allow the full cure time" },
          { title: "Install the shower door only after the tile has cured" },
        ],
      },
      {
        name: "Fixtures and trim",
        items: [
          { title: "Install the toilet on a new seal and check that it does not rock" },
          { title: "Install the vanity level and fix it to the wall" },
          { title: "Fit the vanity top, sink and faucet and seal at the wall" },
          {
            title: "Mount accessories into blocking, not into tile alone",
            description:
              "Towel bars and grab bars pulled out of tile take the tile with them.",
          },
          { title: "Install the mirror, lighting and any medicine cabinet" },
          { title: "Fit the shower trim, valve handle and shower head" },
          { title: "Run water at every fixture and check under the vanity and around the toilet" },
          {
            title: "Test the exhaust fan airflow",
            description:
              "Hold a single sheet of tissue against the grille; it should stay in place while the fan runs.",
          },
        ],
      },
      {
        name: "Final walkthrough",
        items: [
          {
            title: "Run the shower for 10 minutes and check the drain and the ceiling below",
            description:
              "A slow leak shows up on the ceiling of the room underneath before it shows anywhere else.",
          },
          { title: "Check that hot and cold are on the correct sides at every fixture" },
          { title: "Test the GFCI, every switch and the fan timer" },
          { title: "Check for gaps in the sealant at the tub, shower base and countertop" },
          { title: "Confirm the door clears the finished floor and closes cleanly" },
          { title: "Confirm all inspections passed and collect the final sign off" },
          { title: "Collect warranties, spare tile, and the paint and grout color names" },
          { title: "Agree completion dates for the punch list items before the final payment" },
        ],
      },
    ],
    faq: [
      {
        q: "What are the standard bathroom clearances?",
        a: "The two that decide most layouts are 15 inches from the toilet centerline to any side wall or fixture, and 21 inches of clear space in front of the toilet. A shower is commonly at least 30 by 30 inches inside. Local codes vary, so confirm them with your building department before the layout is final.",
      },
      {
        q: "Do I really need to flood test the shower pan?",
        a: "Yes. Plugging the drain and holding water in the pan for 24 hours is the only test that proves the waterproofing works before tile hides it. A failed pan found after tiling means removing the tile, and it is the single most expensive bathroom mistake.",
      },
      {
        q: "What size exhaust fan does a bathroom need?",
        a: "A common rule is 1 CFM per square foot of floor area with a minimum of 50 CFM, and around 50 CFM per fixture in larger bathrooms. The duct matters as much as the fan: it must be short, rigid or insulated, and it must end outside the building rather than in the attic.",
      },
    ],
    related: [
      "kitchen-renovation-checklist",
      "whole-house-renovation-checklist",
      "contractor-punch-list",
    ],
    guides: [
      "italian-kitchen-and-bathroom-renovation-checklist",
      "contractor-punch-list-how-to-write-one",
      "understanding-italian-renovation-estimates",
    ],
    cta: "/for-homeowners",
    publishedAt: "2026-09-08",
  },

  // ---------------------------------------------------------------------------
  // 3. Whole-house renovation
  // ---------------------------------------------------------------------------
  {
    slug: "whole-house-renovation-checklist",
    name: "Whole-House Renovation",
    metaTitle: "Whole-House Renovation Checklist",
    metaDesc:
      "A whole-house renovation checklist from pre-construction through closeout, covering permits, structure, envelope, rough-in, finishes and handover.",
    keywords: [
      "whole house renovation checklist",
      "gut renovation checklist",
      "home renovation phases",
      "renovation project management",
      "pre-construction checklist",
      "construction closeout checklist",
      "renovation schedule template",
      "general contractor checklist",
    ],
    kicker: "Checklist template",
    intro:
      "A whole-house renovation is a dozen small projects that have to happen in the right order, and the cost of getting the order wrong grows with every phase. This checklist runs from the first budget conversation to the twelve month review, at the level of detail a homeowner and a general contractor would actually track together. It is written to be edited: keep the phases your project has and delete the rest.",
    howToUse: [
      "Start a project from this template and work through the pre-construction section before signing anything. Most whole-house overruns are decided in that section, not on site, because scope and contract type set who carries the risk.",
      "Assign each phase to its owner and use the monthly report as the reporting rhythm. On a project this size the useful question is not what happened today but which phase is finished, which is next, and what is blocking it.",
      "Photograph everything before it is covered. Every wall and ceiling before drywall, the waterproofing before tile, and the trenches before backfill. Attach the photos to the item so they stay with the record instead of in someone's phone.",
    ],
    audience: [
      "Homeowners",
      "General contractors",
      "Architects",
      "Project managers",
      "Owner builders",
      "Investors",
      "Property developers",
      "Remote owners",
    ],
    sections: [
      {
        name: "Pre-construction planning",
        items: [
          {
            title: "Write down the goals and separate them from the wish list",
            description:
              "Note what the project has to achieve and what would only be nice, so later cuts are quick decisions.",
          },
          {
            title: "Set the total budget with a contingency of 15 to 20 percent",
            description:
              "An older house uncovers more surprises than a single room, and a whole-house scope finds most of them.",
          },
          { title: "Decide whether you will live in the house during the work" },
          { title: "Order a survey, and a structural report if the plan touches walls or floors" },
          { title: "Run a title, easement and zoning check before design work starts" },
          {
            title: "Interview more than one contractor and compare identical scopes",
            description:
              "Give every bidder the same written scope, otherwise the prices cannot be compared.",
          },
          {
            title: "Agree the contract type",
            description:
              "Fixed price, cost plus and guaranteed maximum price each place the risk differently between you and the contractor.",
          },
          { title: "Tie the payment schedule to milestones rather than to calendar dates" },
          { title: "Agree in writing how changes will be priced and approved" },
        ],
      },
      {
        name: "Design and drawings",
        items: [
          { title: "Produce measured drawings of the house as it exists" },
          {
            title: "Have the contractor review the floor plans before the permit application",
            description:
              "A builder finds constructability problems that only appear when someone prices the work.",
          },
          { title: "Fix the structural design and beam sizes with an engineer" },
          { title: "Produce electrical and lighting plans room by room" },
          { title: "Produce plumbing and mechanical layouts" },
          {
            title: "Choose the heating and cooling approach early",
            description:
              "Duct routes, radiator positions and equipment locations change framing, ceiling heights and floor plans.",
          },
          {
            title: "Build a finish schedule listing every material by room",
            description:
              "One table of floor, wall, trim, tile and paint per room removes most site questions later.",
          },
          {
            title: "Freeze the design before the permit application goes in",
            description:
              "Changes after permit cost drawing time, review time and usually construction rework as well.",
          },
        ],
      },
      {
        name: "Permits and approvals",
        items: [
          { title: "Identify every permit the scope requires" },
          { title: "Submit the permit application with the required drawings and calculations" },
          { title: "Get historic, design review or association approval where required" },
          { title: "Prepare the energy code compliance documents" },
          { title: "Arrange utility disconnections and reconnections with each supplier" },
          { title: "Confirm the contractor license, insurance and bond" },
          {
            title: "Build the inspection sequence into the schedule",
            description:
              "List each inspection as a scheduled event, because a missed one stops the following trade.",
          },
          { title: "Post the permit and keep the approved drawings on site" },
        ],
      },
      {
        name: "Site setup and protection",
        items: [
          { title: "Set up site access, parking, delivery space and waste collection" },
          { title: "Install temporary power, water and lighting" },
          {
            title: "Protect everything that stays",
            description:
              "Cover floors, stairs and trim outside the scope, and photograph their condition before work starts.",
          },
          { title: "Move out or store furniture and belongings" },
          { title: "Set up dust barriers and negative pressure where needed" },
          { title: "Agree working hours and notify the neighbors" },
          { title: "Install temporary weather protection for any opened roof or wall" },
        ],
      },
      {
        name: "Demolition and abatement",
        items: [
          { title: "Test for asbestos, lead and mold before demolition" },
          { title: "Use licensed contractors for any abatement and keep the certificates" },
          { title: "Cap and label every utility in the demolition zone" },
          { title: "Remove finishes in the sequence the following trades need" },
          {
            title: "Shore the structure before removing any load bearing element",
            description:
              "Temporary support goes in first, designed by the engineer where the span requires it.",
          },
          {
            title: "Record what is found behind the finishes",
            description:
              "Old wiring, failed plumbing, rot and unexpected framing all change the scope, so document and price them as they appear.",
          },
          { title: "Keep salvage separate from waste" },
        ],
      },
      {
        name: "Structural work",
        items: [
          { title: "Repair or replace damaged framing, joists and sill plates" },
          { title: "Install new beams, columns and their footings to the engineer detail" },
          { title: "Correct floor levels before any finish work" },
          { title: "Address foundation cracks, drainage and water entry" },
          { title: "Frame new walls, openings and any stair changes" },
          {
            title: "Confirm ceiling heights after new framing and services are in",
            description:
              "Ducts and beams eat headroom, so check the finished height before drywall is ordered.",
          },
          { title: "Book and pass the framing and structural inspections" },
        ],
      },
      {
        name: "Roof, windows and envelope",
        items: [
          { title: "Replace or repair the roof before interior finishes start" },
          { title: "Install flashing at every roof to wall junction, chimney and penetration" },
          {
            title: "Set windows and doors with the correct sill pan and flashing sequence",
            description:
              "Most window leaks are installation faults, not product faults, so watch this step.",
          },
          { title: "Install the water resistive barrier and tape the seams" },
          { title: "Correct the grading and move downpipe discharge away from the house" },
          { title: "Insulate and air seal the envelope as one continuous layer" },
          { title: "Repair or install siding, render and exterior trim" },
          { title: "Run a blower door test where the energy code requires one" },
        ],
      },
      {
        name: "Mechanical, electrical and plumbing rough-in",
        items: [
          {
            title: "Coordinate duct, pipe and wire routes before any trade starts",
            description:
              "Walk the house with all three trades and settle the conflicts on paper rather than in the ceiling.",
          },
          { title: "Rough in plumbing supply, drain and vent lines and pressure test them" },
          { title: "Rough in heating and cooling equipment, ducts and refrigerant lines" },
          { title: "Rough in ventilation for kitchens, bathrooms and the dryer" },
          {
            title: "Upgrade the electrical panel and service if the load calculation requires it",
            description:
              "Do the load calculation before choosing appliances, heating and any vehicle charger.",
          },
          { title: "Rough in wiring, boxes, and low voltage for data, alarm and cameras" },
          { title: "Plan smoke and carbon monoxide alarm locations to code" },
          { title: "Photograph every wall and ceiling before it is closed" },
          { title: "Pass all rough-in inspections before insulation goes in" },
        ],
      },
      {
        name: "Insulation, drywall and carpentry",
        items: [
          { title: "Air seal every penetration before insulating" },
          { title: "Insulate walls, floors and the roof or attic to the specified values" },
          { title: "Book and pass the insulation inspection" },
          { title: "Hang, tape, sand and prime the drywall" },
          { title: "Install interior doors, jambs and hardware" },
          { title: "Install trim, skirting, stairs and railings" },
          {
            title: "Add blocking for cabinets, shelving, grab bars and wall mounted screens",
            description:
              "Mark the positions on the plan now, because every one of them is a wall opening later.",
          },
        ],
      },
      {
        name: "Finishes",
        items: [
          { title: "Paint ceilings and walls before flooring where the sequence allows" },
          { title: "Install flooring room by room and protect it immediately" },
          { title: "Install cabinets, then template countertops once the cabinets are fixed" },
          { title: "Set tile in wet areas over completed and tested waterproofing" },
          { title: "Install light fittings, switch plates and air registers" },
          { title: "Install plumbing fixtures and trim" },
          { title: "Install appliances and test each one through a full cycle" },
          { title: "Complete exterior paint, decking and landscaping repairs" },
        ],
      },
      {
        name: "Systems commissioning",
        items: [
          {
            title: "Start up and balance the heating and cooling system",
            description:
              "Record airflow or flow rate by room, so a cold room can be traced later instead of guessed at.",
          },
          { title: "Confirm the hot water temperature and any recirculation settings" },
          { title: "Measure the actual airflow at every ventilation fan" },
          { title: "Test every smoke and carbon monoxide alarm" },
          { title: "Label the electrical panel and every shutoff valve" },
          { title: "Set up the thermostats and controls and have them demonstrated to you" },
        ],
      },
      {
        name: "Closeout and handover",
        items: [
          { title: "Walk every room and write one shared punch list" },
          { title: "Confirm every inspection passed and obtain the completion or occupancy certificate" },
          { title: "Collect as built drawings and the pre-drywall photographs" },
          { title: "Collect warranties, manuals and equipment serial numbers" },
          { title: "Collect lien releases from the contractor and every subcontractor" },
          {
            title: "Record paint colors, tile batches and material sources",
            description:
              "One page of product names saves a search in five years when a repair needs a match.",
          },
          { title: "Label and store the leftover tile, flooring and paint by room" },
          { title: "Hold the final payment until every punch list item is complete" },
          {
            title: "Book a review at 6 and 12 months",
            description:
              "Settlement cracks, sticking doors and warranty items show up in the first year, while the warranty still applies.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "What order do the phases go in?",
        a: "Planning and design, permits, site setup, demolition, structure, roof and envelope, mechanical and electrical and plumbing rough-in, inspections, insulation and drywall, interior carpentry, finishes, commissioning, then closeout. The envelope should be weather tight before interior finishes start, and rough-in inspections gate everything that closes a wall.",
      },
      {
        q: "How much contingency should a whole-house renovation carry?",
        a: "Plan 15 to 20 percent on an older building. Demolition regularly exposes failed plumbing, undersized framing, old wiring and water damage that no survey could see, and the repairs are not optional once the wall is open.",
      },
      {
        q: "Can I live in the house during the work?",
        a: "Sometimes, if the work is phased and there is a functioning bathroom and kitchen at all times. It usually adds time and cost because the crew works in smaller zones with more protection, so compare that added cost against the price of renting elsewhere before deciding.",
      },
      {
        q: "What should I keep after the project finishes?",
        a: "The pre-drywall photographs, as built drawings, permit sign offs, every warranty and manual, lien releases, and a list of paint colors and tile batches. Anyone who later works on the house, or buys it, will ask for exactly this set.",
      },
    ],
    related: [
      "kitchen-renovation-checklist",
      "bathroom-remodel-checklist",
      "contractor-punch-list",
    ],
    guides: [
      "how-to-manage-a-home-renovation-remotely",
      "renovation-progress-report-what-to-expect",
      "contractor-punch-list-how-to-write-one",
      "second-home-renovation-management",
    ],
    cta: "/for-homeowners",
    publishedAt: "2026-09-08",
  },

  // ---------------------------------------------------------------------------
  // 4. Punch list / final walkthrough
  // ---------------------------------------------------------------------------
  {
    slug: "contractor-punch-list",
    name: "Punch List / Final Walkthrough",
    metaTitle: "Punch List Template for Contractors",
    metaDesc:
      "A room-by-room punch list template for contractors and homeowners, with the checks that come up on most final walkthroughs before final payment.",
    keywords: [
      "punch list template",
      "contractor punch list",
      "final walkthrough checklist",
      "construction punch list",
      "snag list template",
      "project closeout checklist",
      "defect list construction",
      "final inspection checklist",
    ],
    kicker: "Checklist template",
    intro:
      "A punch list only works if everyone is looking at the same list, in a room by room order, with each line written as a check that can pass or fail. This template covers the items that come up on most final walkthroughs, from the exterior to the closeout paperwork. Take it on site, mark what fails, add a photo to each failure, and assign it.",
    howToUse: [
      "Duplicate the room sections for each actual room in the project and rename them, so the list matches the building. A three bedroom house gets three bedroom sections, and each one is walked separately.",
      "Write every item as something that either passes or does not, then attach a photo to each failure. A photo with the item removes the argument about what was meant, and it also removes the second visit to explain the problem.",
      "Assign each failed item to a trade with a date. Hold the final payment until the list is clear, and keep the closed list as the record of what was accepted, because that is the document people come back to.",
    ],
    audience: [
      "General contractors",
      "Subcontractors",
      "Site supervisors",
      "Homeowners",
      "Property managers",
      "Inspectors",
      "Architects",
    ],
    sections: [
      {
        name: "Exterior",
        items: [
          { title: "Siding, render and trim are complete with no gaps or unpainted edges" },
          { title: "Exterior paint covers evenly with no drips or overspray on glass and hardware" },
          { title: "Gutters and downpipes are fixed, sloped, and discharge away from the foundation" },
          { title: "Exterior doors close and latch without rubbing, and the weatherstripping seals" },
          { title: "Windows open, close and lock, and the screens are fitted" },
          { title: "Exterior sealant is continuous at windows, doors and all penetrations" },
          { title: "Exterior lights and receptacles work, and the receptacle covers are weather rated" },
          { title: "Walkways, steps and railings are secure and free of trip hazards" },
          { title: "The site is clear of debris and the grading and landscaping are restored" },
        ],
      },
      {
        name: "Entry and living areas",
        items: [
          { title: "Doors close and latch without rubbing" },
          { title: "Door hardware is aligned, tight, and set at a consistent height" },
          { title: "Floors are free of squeaks, gaps, scratches and lifted edges" },
          { title: "Transitions and thresholds are secure and flush" },
          { title: "Trim and skirting joints are filled, sanded and painted" },
          { title: "Walls are free of nail pops, visible tape lines, roller marks and patch shadows" },
          { title: "Ceilings are free of cracks and stains, and light fittings are centered and level" },
          { title: "Switches, receptacles and cover plates are level, tight and working" },
          { title: "Windows lock, the glass is clean, and all labels are removed" },
        ],
      },
      {
        name: "Kitchen",
        items: [
          { title: "Cabinet doors and drawers align, close fully, and clear each other" },
          { title: "Drawer and door hardware is straight, tight and consistent" },
          { title: "Countertop seams are tight, flush and color matched" },
          { title: "Sink cutout edges are finished and the sink is sealed to the counter" },
          { title: "Faucet and sprayer work with no leak under the sink" },
          { title: "Dishwasher is level, secured, and drains with no leak after a full cycle" },
          { title: "Range hood runs at every speed, the light works, and the duct exhausts outside" },
          { title: "Range and refrigerator sit level with even gaps to the cabinets" },
          { title: "GFCI receptacles trip and reset, and the under cabinet lighting works" },
          { title: "Backsplash grout and sealant are complete and clean" },
        ],
      },
      {
        name: "Bathrooms",
        items: [
          { title: "Toilet is secure, does not rock, and refills without running on" },
          { title: "Vanity is level and fixed to the wall, with the top sealed at the wall" },
          { title: "Faucet and drain work with no leak inside the cabinet" },
          { title: "Hot and cold are on the correct sides at every fixture" },
          { title: "Shower drains fully with no standing water left on the floor" },
          { title: "Shower door closes, seals, and does not drip outside the enclosure" },
          { title: "Tile is flat, grout is complete, and changes of plane are sealed with flexible sealant" },
          { title: "Exhaust fan holds a sheet of tissue to the grille and vents to the outside" },
          { title: "Mirror, accessories and grab bars are fixed into blocking" },
          { title: "GFCI protection works at every receptacle" },
        ],
      },
      {
        name: "Bedrooms",
        items: [
          { title: "Doors close, latch, and clear the finished floor" },
          { title: "Closet doors, tracks and shelving run smoothly and are secure" },
          { title: "Walls and ceilings are free of visible patches and roller marks" },
          { title: "Floors are level and free of gaps at the walls and transitions" },
          { title: "Every receptacle, switch and ceiling fitting works" },
          { title: "Windows open, lock, and have working locks and fitted screens" },
          { title: "Smoke alarm is installed, powered and tested" },
          { title: "Registers and grilles are fitted and airflow reaches the room" },
        ],
      },
      {
        name: "Mechanical and utility",
        items: [
          { title: "Heating and cooling reach the set temperature in every room" },
          { title: "Filters are new and accessible, and the filter size is recorded" },
          { title: "Water heater is supported, vented, and set to the specified temperature" },
          { title: "No leaks at the water heater, shutoffs, hose bibs or any visible pipe" },
          { title: "Electrical panel is clearly labeled and the cover is fitted" },
          { title: "No circuit trips under normal load" },
          { title: "Dryer vent runs to the outside with no crushed sections" },
          { title: "Sump pump, floor drains and any backflow device operate" },
          { title: "Attic and crawl space insulation is complete and access hatches are sealed" },
        ],
      },
      {
        name: "Paperwork and closeout",
        items: [
          { title: "All permits are closed and every final inspection has passed" },
          { title: "Completion or occupancy certificate is issued and filed" },
          { title: "Warranties, manuals and equipment serial numbers are collected" },
          { title: "As built drawings and pre-drywall photographs are handed over" },
          { title: "Lien releases are signed by the contractor and every subcontractor" },
          { title: "Paint, tile and flooring product names and batch numbers are recorded" },
          { title: "Spare materials are labeled and stored" },
          { title: "Keys, remotes, access codes and alarm codes are handed over" },
          { title: "Every open punch list item has an agreed completion date before final payment" },
        ],
      },
    ],
    faq: [
      {
        q: "When should the punch list be created?",
        a: "Walk the project when the work is substantially complete but before the crew leaves, and write the list on site with the contractor present. A list written after everyone has moved to the next job turns into a negotiation instead of a task list.",
      },
      {
        q: "How should a punch list item be written?",
        a: "As a single check that either passes or fails, in one sentence, naming the room and the location. Compare \"Doors close and latch without rubbing\" with \"door problem\": only the first tells a carpenter what to do and lets anyone confirm it is done.",
      },
      {
        q: "How much should be held back until the punch list is clear?",
        a: "That depends on the contract, but the retained amount has to be large enough that finishing the list is worth more to the contractor than walking away from it. Agree the figure and the completion date in the contract rather than at the walkthrough.",
      },
      {
        q: "Does everyone need to read the list in the same language?",
        a: "No, and that is the point of this template. The list is written once and each person sees it in their own language, along with the comments and photos, so a bilingual job does not need two separate lists that drift apart.",
      },
    ],
    related: [
      "kitchen-renovation-checklist",
      "bathroom-remodel-checklist",
      "whole-house-renovation-checklist",
    ],
    guides: [
      "contractor-punch-list-how-to-write-one",
      "bilingual-construction-checklist-english-spanish",
      "renovation-progress-report-what-to-expect",
    ],
    cta: "/for-contractors",
    publishedAt: "2026-09-08",
  },

  // ---------------------------------------------------------------------------
  // 5. Renovation in Italy
  // ---------------------------------------------------------------------------
  {
    slug: "italy-renovation-checklist",
    name: "Renovation in Italy",
    metaTitle: "Renovation in Italy: Checklist Template",
    metaDesc:
      "A renovation checklist for Italy: visura, conformità urbanistica, CILA or SCIA, impianti, bonifico parlante, fine lavori and agibilità, in phases.",
    keywords: [
      "renovation in italy checklist",
      "italian renovation process",
      "CILA SCIA permesso di costruire",
      "conformita urbanistica",
      "bonifico parlante",
      "geometra italy renovation",
      "italian building permits",
      "agibilita fine lavori",
      "buying and renovating in italy",
    ],
    kicker: "Checklist template",
    intro:
      "Renovating in Italy follows a documented sequence, and most of the difficulty for a foreign owner is knowing which document belongs to which phase. This checklist lays out the phases from purchase due diligence to agibilità, using the Italian terms your geometra and impresa will actually use, with the English meaning next to each one. The paperwork items matter as much as the building items, because a missing declaration can block a utility contract or a future sale.",
    howToUse: [
      "Work the purchase and due diligence section before you buy, not after. Planning and cadastral compliance problems are far cheaper to solve as a condition of sale than as a surprise once the property is yours.",
      "Share the project with your geometra or architetto and the impresa, and let each of them own their phase. They read the items in Italian while you read them in English, so there is one list rather than a chain of translated emails.",
      "Treat the fiscal section as strictly as the building sections. Deductions and incentives in Italy depend on payment method and invoice wording, so a payment made the wrong way cannot be fixed afterwards.",
    ],
    audience: [
      "Foreign buyers in Italy",
      "Second home owners",
      "Expat homeowners",
      "Geometri and architetti",
      "Imprese edili",
      "Remote project owners",
      "Italian American families",
    ],
    sections: [
      {
        name: "Purchase and due diligence (acquisto e verifiche)",
        items: [
          {
            title: "Order the visura catastale (land registry extract)",
            description:
              "It shows the registered holder, the parcel and building identifiers, and the cadastral category of the property.",
          },
          {
            title: "Order the planimetria catastale (registered floor plan)",
            description:
              "Compare it with the building as it stands, because any difference has to be corrected before or during the work.",
          },
          {
            title: "Check the conformità urbanistica (planning compliance)",
            description:
              "Confirm the built layout matches the approved permits and that every past change was authorized.",
          },
          {
            title: "Check the conformità catastale (cadastral compliance)",
            description:
              "The registered plan and the actual layout have to agree, and correcting them is the seller's problem before completion and yours after.",
          },
          { title: "Request the atto di provenienza (deed of origin) and the full title history" },
          {
            title: "Request the APE (energy performance certificate)",
            description:
              "It is required for the sale, and it also tells you where the building loses heat.",
          },
          {
            title: "Check whether a vincolo (heritage or landscape restriction) applies",
            description:
              "A vincolo means the Soprintendenza has to approve the work, which adds review time and limits materials.",
          },
          {
            title: "Check the condominium rules and the tabelle millesimali if the property is in a condominio",
            description:
              "They set what you may change and your share of any shared works already voted through.",
          },
          { title: "Ask for the certificato di agibilità (fitness for use certificate)" },
        ],
      },
      {
        name: "Team (il team)",
        items: [
          {
            title: "Appoint a geometra or architetto as technical lead",
            description:
              "This person prepares the drawings, files the permits, and is the contact the comune deals with.",
          },
          {
            title: "Name the direttore dei lavori (works supervisor)",
            description:
              "It is a legally defined role, responsible for supervising the work against the filed permit.",
          },
          { title: "Appoint the impresa (construction company) with a written contract" },
          {
            title: "Request the DURC for every company on site",
            description:
              "The DURC confirms the company is current on its social security and insurance contributions.",
          },
          {
            title: "Check the visura camerale (company register extract) and the insurance",
            description:
              "It confirms the company exists, who can sign for it, and whether it is in any insolvency procedure.",
          },
          {
            title: "Appoint the coordinatore per la sicurezza (safety coordinator) where required",
            description:
              "This is required when more than one company works on the site, and it is a legal obligation of the client.",
          },
          {
            title: "Agree the computo metrico estimativo (itemized cost estimate) as the basis of the contract",
            description:
              "It lists each work item with a quantity and a unit price, so later changes can be priced against it.",
          },
          { title: "Agree the cronoprogramma (schedule) and the payment stages" },
          {
            title: "Decide who signs and receives documents while you are abroad",
            description:
              "A procura (power of attorney) may be needed, and it is easier to prepare before the work starts.",
          },
        ],
      },
      {
        name: "Permits (permessi)",
        items: [
          { title: "Have the geometra confirm which permit the scope requires" },
          {
            title: "File a CILA for work that does not touch structure or the exterior",
            description:
              "The CILA is a notification of works filed before starting, used for maintenance and internal changes.",
          },
          {
            title: "File a SCIA for more substantial restructuring",
            description:
              "The SCIA is a certified notification covering work that affects structure, layout or the facade.",
          },
          {
            title: "Apply for a permesso di costruire where the work is major",
            description:
              "This is a full building permit, required for changes in volume or use, and it takes considerably longer to obtain.",
          },
          {
            title: "Submit to the Soprintendenza where a vincolo applies",
            description:
              "Allow months rather than weeks, and expect conditions on windows, render, roof and colors.",
          },
          { title: "File the structural notice with the Genio Civile or the comune where required" },
          {
            title: "File for the change of destinazione d'uso if the use of the property changes",
            description:
              "Turning a storeroom or an agricultural building into a dwelling is a change of use, not a renovation.",
          },
          { title: "Notify the comune of the inizio lavori (start of works) date" },
          { title: "Post the cartello di cantiere (site notice) with the permit details" },
        ],
      },
      {
        name: "Demolition and structural (demolizioni e strutture)",
        items: [
          { title: "Agree the demolition scope in writing with the impresa" },
          {
            title: "Arrange the smaltimento macerie (waste disposal) with proper documentation",
            description:
              "Keep the disposal receipts, because they form part of the legal project record.",
          },
          {
            title: "Check for amianto (asbestos) before demolition",
            description:
              "Old roof sheets and pipe insulation often contain it, and removal must be done by a licensed company.",
          },
          {
            title: "Survey the solai (floor structures) and travi (beams) for condition and load capacity",
            description:
              "Old timber and hollow tile floors often need strengthening before new finishes or a new bathroom are added.",
          },
          { title: "Confirm every structural opening has an engineer calculation and permit cover" },
          {
            title: "Check for umidità di risalita (rising damp) and agree the treatment",
            description:
              "Stone and masonry walls at ground level frequently need this addressed before plaster and finishes.",
          },
          { title: "Confirm how much intonaco (plaster) is removed and what replaces it" },
          { title: "Record the state of the shell with photographs and measurements before rebuilding" },
        ],
      },
      {
        name: "Systems (impianti)",
        items: [
          {
            title: "Confirm the existing electrical supply and whether it needs increasing",
            description:
              "Many older homes are contracted at 3 kW, which will not run an electric oven, an induction hob and a heat pump; 6 kW is a common upgrade.",
          },
          {
            title: "Request the potenza increase from the electricity supplier early",
            description:
              "The meter change takes weeks, and the impianto has to be finished and certified before it happens.",
          },
          { title: "Plan the impianto elettrico with a drawing showing every point and circuit" },
          { title: "Plan the impianto idraulico (plumbing) including the scarichi (drains) and their falls" },
          {
            title: "Confirm the caldaia (boiler) or heat pump position and the flue route",
            description:
              "Both the position and the discharge point are regulated, and a condominio may restrict them further.",
          },
          {
            title: "Confirm whether the canna fumaria (flue) needs upgrading and where it may terminate",
            description:
              "A shared or old flue often cannot serve a modern condensing boiler without being relined.",
          },
          { title: "Plan the impianto di condizionamento (air conditioning) routes before the walls close" },
          {
            title: "Collect the dichiarazione di conformità for every impianto",
            description:
              "The installer issues this declaration of conformity, and you need it for agibilità, for utility contracts, and for any future sale.",
          },
          { title: "Arrange verification of the systems before finishes cover them" },
          {
            title: "Photograph every wall and floor before the tracce (chases) are closed",
            description:
              "These photographs are the only record of where cables and pipes run inside the masonry.",
          },
        ],
      },
      {
        name: "Finishes (finiture)",
        items: [
          { title: "Confirm the pavimenti (floor finishes) and the finished level at every doorway" },
          { title: "Confirm the rivestimenti (wall tiling) extents in the bathrooms and the kitchen" },
          { title: "Confirm the impermeabilizzazione (waterproofing) under all wet area tiling" },
          {
            title: "Confirm the massetto (screed) thickness and its drying time",
            description:
              "A screed has to dry before flooring is laid, and on many projects this is what sets the completion date.",
          },
          {
            title: "Confirm the serramenti (windows and doors) sizes, glazing and lead time",
            description:
              "These are usually the longest lead item, and a vincolo may dictate the material and the profile.",
          },
          { title: "Confirm the tinteggiatura (painting) colors and the finish for each room" },
          { title: "Confirm the cucina (kitchen) connection points against the supplier drawing" },
          { title: "Confirm the sanitari and rubinetteria (sanitary ware and taps) models against the rough-in" },
        ],
      },
      {
        name: "Utilities and contracts (utenze)",
        items: [
          {
            title: "Arrange the voltura (transfer) of the electricity contract into your name",
            description:
              "A voltura keeps the existing connection, while a new contract on a disconnected meter takes longer.",
          },
          { title: "Arrange the voltura or a new contract for gas" },
          { title: "Arrange the water contract with the local supplier" },
          {
            title: "Register the property for TARI (waste collection charge)",
            description:
              "It is charged to the occupier, and registration is a separate step from the other utilities.",
          },
          { title: "Set up a temporary site supply if the meters were removed" },
          { title: "Provide the dichiarazione di conformità where a supplier requires it before activating a meter" },
          { title: "Set up the condominium payments if the property is in a condominio" },
          { title: "Arrange building insurance that covers the works period" },
        ],
      },
      {
        name: "Fiscal and payments (fisco e pagamenti)",
        items: [
          {
            title: "Confirm which detrazioni (tax deductions) the work may qualify for",
            description:
              "The rules and percentages change every year, so confirm the current position with an Italian accountant before the first payment.",
          },
          {
            title: "Check whether a deduction is useful to you as a non-resident",
            description:
              "Deductions are set against Italian tax, so they are worth nothing if you have no Italian tax to offset.",
          },
          {
            title: "Pay by bonifico parlante (documented bank transfer)",
            description:
              "The transfer has to state the law reference, your codice fiscale and the recipient tax number, or the deduction is lost.",
          },
          { title: "Keep every fattura (invoice) with the correct wording and your codice fiscale" },
          {
            title: "Confirm the correct IVA (VAT) rate on each invoice",
            description:
              "Renovation work can qualify for a reduced rate, and the invoice has to state the basis for it.",
          },
          { title: "File any notification an incentive requires before the work starts" },
          {
            title: "Keep payments tied to completed stages and never pay ahead of the work",
            description:
              "Advance payments are the most common way a foreign owner loses control of a project in Italy.",
          },
          { title: "Keep one folder with the contract, invoices, transfers and permits" },
        ],
      },
      {
        name: "Closeout (fine lavori e agibilità)",
        items: [
          {
            title: "Have the geometra file the fine lavori (completion of works)",
            description:
              "It has to be filed within the permit validity period, so watch the deadline as the work finishes.",
          },
          { title: "Collect the dichiarazione di conformità for every impianto" },
          {
            title: "Complete the aggiornamento catastale (cadastral update) where the layout changed",
            description:
              "The registered floor plan must match the built layout, filed through the DOCFA procedure.",
          },
          {
            title: "Obtain or update the agibilità (fitness for use)",
            description:
              "It confirms the property is legally habitable, and a buyer or a bank will ask for it.",
          },
          { title: "Obtain a new APE where the work changed the energy performance" },
          { title: "Walk the property with the impresa and write one shared punch list" },
          { title: "Hold the final payment until the punch list and the documents are both complete" },
          { title: "Collect the warranties, manuals and test records" },
          {
            title: "Scan and store every document",
            description:
              "A future sale will require the permits, declarations, cadastral plan and agibilità together in one set.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "Do I need a geometra or an architetto?",
        a: "You need one of them, and for most residential renovations a geometra is the usual choice: they file the permits, prepare the drawings and deal with the comune. An architetto is the better fit where design, a change of use, or a property under vincolo is involved. Either way, this person is the one who signs the filings, so choose them before choosing the builder.",
      },
      {
        q: "What is the difference between CILA, SCIA and permesso di costruire?",
        a: "A CILA is a notification for work that does not touch structure or the exterior. A SCIA is a certified notification for more substantial restructuring that affects structure, layout or the facade. A permesso di costruire is a full building permit, needed for major work, changes in volume, or a change of use, and it takes the longest to obtain. Your geometra decides which applies.",
      },
      {
        q: "What is a bonifico parlante and why does it matter?",
        a: "It is a bank transfer that states the law the deduction is claimed under, your codice fiscale and the recipient tax number. If a payment for eligible work is made any other way, the deduction is generally lost and cannot be recovered later, so set up the payment wording before the first invoice is due.",
      },
      {
        q: "Can I manage an Italian renovation from another country?",
        a: "Yes, with three things in place: a named person on site who is not the builder, a fixed reporting rhythm with the same photographs each week, and payments released only against completed stages. A shared checklist that each person reads in their own language removes most of the translation delay that otherwise stalls decisions.",
      },
    ],
    related: ["overseas-renovation-checklist", "whole-house-renovation-checklist"],
    guides: [
      "how-to-manage-a-renovation-in-italy-from-the-us",
      "what-is-a-geometra",
      "italian-construction-terminology",
      "understanding-italian-renovation-estimates",
    ],
    cta: "/renovating-abroad",
    publishedAt: "2026-09-08",
  },

  // ---------------------------------------------------------------------------
  // 6. Overseas renovation
  // ---------------------------------------------------------------------------
  {
    slug: "overseas-renovation-checklist",
    name: "Overseas Renovation",
    metaTitle: "Overseas Renovation Checklist",
    metaDesc:
      "A checklist for renovating a property abroad: due diligence, local team, permits, milestone payments, weekly photos, monthly reports and handover.",
    keywords: [
      "overseas renovation checklist",
      "renovating abroad",
      "remote renovation management",
      "second home renovation checklist",
      "international property renovation",
      "managing a builder abroad",
      "milestone payment schedule",
      "remote construction reporting",
    ],
    kicker: "Checklist template",
    intro:
      "Renovating a property in another country is mostly a problem of information: you cannot see the site, the rules are local, and every question crosses a time zone. This checklist is country neutral and built around the three things that keep a remote project under control, which are due diligence before you commit, a fixed reporting rhythm, and payments released only against verified milestones. Use it alongside whatever local process your technical lead follows.",
    howToUse: [
      "Complete the first two sections before signing a purchase or a contract. Almost every serious problem in a remote renovation was visible at that stage to somebody who knew where to look, and the fix is far cheaper as a condition of sale.",
      "Set the communication cadence in writing and hold it. Ask for the same photo views every week from the same positions so changes are comparable, plus a monthly report on progress, spend and the next month's plan.",
      "Keep the checklist as the single record. Everyone reads it in their own language, decisions and change approvals live on the item rather than in a chat thread, and photos stay attached to the work they document.",
    ],
    audience: [
      "Overseas property owners",
      "Second home buyers",
      "Expats",
      "Remote project owners",
      "Investors",
      "Relocating families",
      "Local site managers",
    ],
    sections: [
      {
        name: "Before you commit",
        items: [
          {
            title: "Write down what the finished property has to do",
            description:
              "A rental, a holiday home and a full time home lead to different specifications and different budgets.",
          },
          { title: "Set a total budget including taxes, professional fees and currency movement" },
          { title: "Research typical local build costs per square meter before any design work" },
          { title: "Check whether foreign owners face restrictions on buying or renovating" },
          { title: "Understand the local tax position on owning, renovating and renting the property" },
          { title: "Plan how many site visits you can realistically make, and when they matter most" },
          {
            title: "Decide who can act for you locally when you are not there",
            description:
              "Set this up formally, because many steps need a signature in person or a power of attorney.",
          },
        ],
      },
      {
        name: "Due diligence on the property",
        items: [
          { title: "Confirm the legal owner and that the title is clear of debts and claims" },
          {
            title: "Confirm the building on site matches what is legally registered",
            description:
              "Unregistered extensions and past changes usually have to be legalized before a new permit is granted.",
          },
          { title: "Get an independent structural and damp survey" },
          { title: "Check for heritage, coastal, flood or conservation restrictions" },
          { title: "Check access rights, shared walls and rights of way" },
          { title: "Confirm which utilities are connected and what capacity they have" },
          { title: "Ask for the annual running costs, including local taxes and any association fees" },
        ],
      },
      {
        name: "Building the local team",
        items: [
          { title: "Appoint a local technical professional to lead the drawings and permits" },
          { title: "Confirm every company is registered, insured and current on its obligations" },
          {
            title: "Ask for three recent similar projects and contact those owners",
            description:
              "Ask them about the schedule, the changes and the final cost against the estimate.",
          },
          { title: "Visit a current site of the contractor if a trip is possible" },
          {
            title: "Confirm who supervises the work day to day while you are away",
            description:
              "Somebody has to be on site regularly, and it should not be the same person building it.",
          },
          { title: "Agree the working language and who translates" },
          { title: "Appoint a local lawyer or accountant for contracts and payments" },
          { title: "Put a written limit on what anyone may commit on your behalf" },
        ],
      },
      {
        name: "Permits and legal steps",
        items: [
          { title: "Have the technical lead confirm which permits the scope requires" },
          { title: "Confirm the expected approval time and build it into the schedule" },
          { title: "Confirm what work may legally start before approval, and what may not" },
          { title: "Get any association, neighbor or heritage consent in writing" },
          { title: "Confirm insurance is in place for the whole works period" },
          { title: "Confirm the site safety obligations and who carries them" },
          { title: "Keep copies of every permit and approval in one place" },
        ],
      },
      {
        name: "Contract and money",
        items: [
          {
            title: "Get a written contract with an itemized scope",
            description:
              "A single lump sum on one page gives you nothing to check progress or a change against.",
          },
          {
            title: "Tie payments to completed and verified milestones",
            description:
              "Release each payment only after somebody you trust has confirmed that stage is actually finished.",
          },
          { title: "Keep the deposit as small as the local market allows" },
          { title: "Agree in writing how variations are priced and approved" },
          {
            title: "Agree the retention held until the punch list is complete",
            description:
              "Holding a final percentage until defects are fixed is the main leverage you have at a distance.",
          },
          { title: "Agree the completion date and what happens if it slips" },
          { title: "Plan the currency transfers and budget for exchange rates and fees" },
          { title: "File every invoice and transfer receipt by date as you go" },
        ],
      },
      {
        name: "Communication cadence",
        items: [
          {
            title: "Agree a fixed weekly photo set",
            description:
              "Ask for the same views each week from the same positions, so progress and problems are easy to compare.",
          },
          { title: "Agree a weekly written update against this checklist" },
          { title: "Hold a scheduled video call at the same time every week" },
          { title: "Agree a monthly report covering progress, spend and the next month's plan" },
          { title: "Ask for a walk through video before any wall or floor is closed" },
          { title: "Keep every decision in writing, in one place, readable by everyone" },
          {
            title: "Agree how urgent questions are raised and how fast you will answer",
            description:
              "Time zones stall a site, so set a rule for what the team may decide without waiting for you.",
          },
          { title: "Log every change with a date, a price and the name of whoever approved it" },
        ],
      },
      {
        name: "Systems",
        items: [
          {
            title: "Confirm the electrical supply capacity matches the planned appliances",
            description:
              "Supply upgrades are slow almost everywhere, so check this before choosing an electric kitchen or a heat pump.",
          },
          { title: "Request any supply upgrade early, because meter changes take weeks" },
          { title: "Confirm the heating and cooling approach and where the equipment will sit" },
          { title: "Confirm the hot water capacity for the number of bathrooms" },
          { title: "Confirm the water pressure and whether a pump or a tank is needed" },
          { title: "Confirm drainage, including whether the property is on a sewer or a tank" },
          { title: "Confirm the internet options if the property will be rented" },
          { title: "Collect the installer certificate for every system" },
        ],
      },
      {
        name: "Finishes and long lead items",
        items: [
          {
            title: "Order windows, doors and tile early",
            description:
              "These are usually what sets the finish date, and a delay here idles every following trade.",
          },
          { title: "Confirm tile, stone and flooring quantities with the waste allowance included" },
          {
            title: "Ask for a photo or a sample of the actual batch before ordering",
            description:
              "Stone and tile vary between batches, and a screen image is not a reliable guide to color.",
          },
          { title: "Confirm the waterproofing in wet areas before any tiling starts" },
          { title: "Confirm the kitchen and bathroom layouts against the plumbing rough-in" },
          { title: "Confirm paint colors on site rather than from a screen" },
          { title: "Agree who receives deliveries and checks them for damage on arrival" },
        ],
      },
      {
        name: "Handover and documents",
        items: [
          { title: "Do the walkthrough in person if possible, or by video against this checklist" },
          { title: "Write one shared punch list with photographs and agreed dates" },
          { title: "Confirm every system works, room by room" },
          { title: "Confirm all permits are closed and any completion certificate is issued" },
          { title: "Collect the warranties, manuals and installer certificates" },
          { title: "Collect as built drawings and the photographs taken before walls were closed" },
          { title: "Record paint, tile and flooring references for future repairs" },
          { title: "Get keys, codes and meter readings, and put the ongoing bills in your name" },
          {
            title: "Arrange somebody to check the property between your visits",
            description:
              "A small leak or a blocked gutter found in a month costs a fraction of one found in a year.",
          },
        ],
      },
    ],
    faq: [
      {
        q: "How do I keep control of a renovation I cannot visit?",
        a: "Three habits do most of the work: somebody on site who reports to you and is not the builder, the same set of photographs every week from the same positions, and payments released only against verified milestones. Everything else is detail once those three are in place.",
      },
      {
        q: "How should payments be structured?",
        a: "By milestone, against an itemized scope, with the deposit as small as the local market allows and a retention held until the punch list is clear. Never pay ahead of completed work, because an advance transfers your only leverage to the contractor at the moment you most need it.",
      },
      {
        q: "What should a monthly report include?",
        a: "What was completed against the checklist, what is planned for the next month, spend to date against the budget, any change orders with prices and approvals, and the current view on the completion date. Weekly photographs fill in the detail between reports.",
      },
      {
        q: "How do I handle the language difference with the local crew?",
        a: "Write the checklist once and let each person read it in their own language, including comments and photo captions. That keeps one shared list instead of two that drift apart, and it means a question from the crew reaches you in a form you can answer directly.",
      },
    ],
    related: ["italy-renovation-checklist", "whole-house-renovation-checklist"],
    guides: [
      "how-to-manage-a-home-renovation-remotely",
      "second-home-renovation-management",
      "renovation-progress-report-what-to-expect",
      "questions-to-ask-an-italian-contractor",
    ],
    cta: "/renovating-abroad",
    publishedAt: "2026-09-08",
  },
];
